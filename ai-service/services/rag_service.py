import os
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

BASE_DIR         = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH        = os.path.join(BASE_DIR, 'data', 'civic_faq.txt')
VECTORSTORE_PATH = os.path.join(BASE_DIR, 'vectorstore')

retriever = None
qa_chain  = None

def initialize_rag():
    global retriever, qa_chain

    print("🤖 Initializing RAG pipeline...")

    loader    = TextLoader(DATA_PATH, encoding='utf-8')
    documents = loader.load()
    print(f"✅ Loaded {len(documents)} document(s)")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(documents)
    print(f"✅ Split into {len(chunks)} chunks")

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=os.getenv("GEMINI_API_KEY")
    )

    if os.path.exists(VECTORSTORE_PATH):
        print("✅ Loading existing vectorstore from disk...")
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
        search_kwargs={"k": 3}
    )

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.3
    )

    prompt = PromptTemplate.from_template("""
You are SUVIDHA AI Assistant for Vijayawada Municipal Corporation.
Use the following context to answer the question.
If the answer is not in the context, say "I don't have specific
information about that. Please contact the municipal office at
0866-2570000 for assistance."
Only answer questions related to municipal services.
Keep answers concise and helpful.

Context:
{context}

Question: {question}

Answer:""")

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
            "sources": len(source_docs)
        }

    except Exception as e:
        print(f"❌ get_answer error: {e}")
        raise