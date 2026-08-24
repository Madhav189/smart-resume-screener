import PyPDF2
import pdfplumber
import docx
import io

class DocumentParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        text = ""
        # Try pdfplumber first for better formatting
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            # Fallback to PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text.strip()

    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = []
        for para in doc.paragraphs:
            text.append(para.text)
        return "\n".join(text).strip()

    @staticmethod
    def parse(file_bytes: bytes, filename: str) -> str:
        if filename.lower().endswith(".pdf"):
            return DocumentParser.parse_pdf(file_bytes)
        elif filename.lower().endswith(".docx"):
            return DocumentParser.parse_docx(file_bytes)
        elif filename.lower().endswith(".txt"):
            return file_bytes.decode('utf-8').strip()
        else:
            raise ValueError(f"Unsupported file type: {filename}")
