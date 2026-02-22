#!/usr/bin/env python3
"""
Convert text files to PDF for testing
Requires: pip install fpdf2
"""

from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Requirements Document', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_body(self, text):
        self.set_font('Arial', '', 10)
        # Handle text encoding
        text = text.encode('latin-1', 'replace').decode('latin-1')
        self.multi_cell(0, 5, text)
        self.ln()

def convert_txt_to_pdf(txt_file, pdf_file):
    """Convert a text file to PDF"""
    print(f"Converting {txt_file} to {pdf_file}...")
    
    # Create PDF object
    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Read text file
    try:
        with open(txt_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {txt_file}: {e}")
        return False
    
    # Add content to PDF
    try:
        pdf.chapter_body(content)
        pdf.output(pdf_file)
        print(f"✓ Successfully created {pdf_file}")
        return True
    except Exception as e:
        print(f"Error creating PDF: {e}")
        return False

def main():
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Files to convert
    files = [
        ('sample-requirements.txt', 'sample-requirements.pdf'),
        ('healthcare-app-requirements.txt', 'healthcare-app-requirements.pdf')
    ]
    
    success_count = 0
    for txt_file, pdf_file in files:
        txt_path = os.path.join(script_dir, txt_file)
        pdf_path = os.path.join(script_dir, pdf_file)
        
        if not os.path.exists(txt_path):
            print(f"✗ File not found: {txt_path}")
            continue
        
        if convert_txt_to_pdf(txt_path, pdf_path):
            success_count += 1
    
    print(f"\n{success_count}/{len(files)} files converted successfully")

if __name__ == '__main__':
    main()
