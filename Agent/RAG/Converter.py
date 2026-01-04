import subprocess
from pathlib import Path


def convert_to_pdf(input_path: str) -> str:
    """Convert a docx/xlsx file to PDF using LibreOffice and return the PDF path."""
    input_path = str(Path(input_path))
    output_dir = Path(input_path).parent
    subprocess.run([
        "libreoffice",
        "--headless",
        "--convert-to",
        "pdf",
        input_path,
        "--outdir",
        str(output_dir),
    ], check=True)

    return str(Path(input_path).with_suffix(".pdf"))
