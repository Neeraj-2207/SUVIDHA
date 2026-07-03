import os

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from prompts.municipal_prompts import MUNICIPAL_RAG_PROMPT
from config import DATA_PATH, VECTORSTORE_PATH, GEMINI_API_KEY


retriever = None
qa_chain  = None

def initialize_rag():
    global retriever, qa_chain

    print(" Initializing RAG pipeline...")

    loader    = TextLoader(DATA_PATH, encoding='utf-8')
    documents = loader.load()
    print(f" Loaded {len(documents)} document(s)")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )
    chunks = splitter.split_documents(documents)
    print(f" Split into {len(chunks)} chunks")

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=GEMINI_API_KEY
    )

    if os.path.exists(VECTORSTORE_PATH):
        print(" Loading existing vectorstore from disk...")
        vectorstore = FAISS.load_local(
            VECTORSTORE_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )
    else:
        print("⚙️  Creating new vectorstore...")
        vectorstore = FAISS.from_documents(chunks, embeddings)
        os.makedirs(VECTORSTORE_PATH, exist_ok=True)
        vectorstore.save_local(VECTORSTORE_PATH)
        print("✅ Vectorstore saved to disk")

    retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "score_threshold":0.5,
            "k":5
        }
    )

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GEMINI_API_KEY,
        temperature=0.1
    )

    prompt = MUNICIPAL_RAG_PROMPT

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    qa_chain = (
        {
            "context":  retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    print("✅ RAG pipeline ready!")
    return True


def get_answer(question: str) -> dict:
    global qa_chain, retriever

    if qa_chain is None:
        raise Exception("RAG pipeline not initialized")

    try:
        answer = qa_chain.invoke(question)

        if hasattr(answer, 'content'):
            answer = answer.content

        source_docs = retriever.invoke(question)

        return {
            "answer":  str(answer),
            "sources": [
                {
                    "source": doc.metadata.get("source"),
                    "preview": doc.page_content[:150]
                }
                for doc in source_docs
            ]
        }

    except Exception as e:
        print(f"❌ get_answer error: {e}")
        raise