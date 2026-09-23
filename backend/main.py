import os
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="MKO Environmental AI Workstation")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    # Allow local development
    #allow_origins=["http://localhost", "http://127.0.0.1", "http://localhost:80", "http://127.0.0.1:80"],
    allow_origins=["*"]
    # Allow ANY URL that starts with https://mko- and ends with .vercel.app
    allow_origin_regex=r"https://mko-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Initialize the LLM using Groq (Free Tier)
try:
    llm = ChatOpenAI(
        api_key=os.getenv("GROQ_API_KEY"),
        base_url="https://api.groq.com/openai/v1",
        model="openai/gpt-oss-20b", 
        temperature=0.2
    )
except Exception as e:
    print(f"Error initializing LLM: {e}. Check GROQ_API_KEY in your .env file.")
# Engineered prompt tailored to MKO's environmental reporting needs
summary_prompt = PromptTemplate(
    input_variables=["data_string"],
    template="""
    You are an expert environmental consultant at MKO Ireland. 
    Review the following raw ecological field data collected during a site survey:
    
    {data_string}
    
    Task: Write a concise, professional, non-technical executive summary of this data suitable for a Planning and Environmental report. 
    
    Requirements:
    - Highlight the key species identified.
    - Explicitly note any protected or endangered species.
    - Summarize the total observations concisely.
    - Keep the tone objective, scientific, and strictly professional.
    - Format the output in clean, readable paragraphs. Do not use markdown tables or bullet points.
    """
)

# Modern LCEL (LangChain Expression Language) pipeline
summary_chain = summary_prompt | llm | StrOutputParser()

@app.post("/api/summarize-field-data/")
async def summarize_data(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid format. Please upload a CSV file.")

    try:
        # Asynchronously read and parse the field data
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Convert structured data to a string for the LLM context window
        data_string = df.to_string(index=False)
        
        # Run the modern RAG/LLM pipeline via invoke()
        result = summary_chain.invoke({"data_string": data_string})
        
        return {
            "filename": file.filename, 
            "status": "success",
            "summary": result,
            "row_count": len(df)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data processing error: {str(e)}")