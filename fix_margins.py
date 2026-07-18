import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        text = f.read()
    
    # Replace print:p-0 with print:px-8 print:py-4 or similar to give it good paper margins
    text = text.replace('print:p-0', 'print:p-10')
    
    # Some inputs have print:p-0 which WE DO WANT to keep for inputs!
    # Let's revert the inputs print:p-10 back to print:p-0
    text = text.replace('print:p-10 print:bg-transparent', 'print:p-0 print:bg-transparent')
    
    with open(filepath, 'w') as f:
        f.write(text)

update_file('src/pages/invoice/quotation/QuotationDetailPage.tsx')
update_file('src/pages/invoice/invoice/InvoiceDetailPage.tsx')
