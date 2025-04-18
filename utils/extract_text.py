import mammoth
import csv

def extract_text_from_file(file):
    filename = file.filename
    content_type = file.content_type

    if content_type == "text/plain":
        return file.read().decode("utf-8")

    elif content_type == "text/csv":
        return " ".join([",".join(row) for row in csv.reader(file.read().decode("utf-8").splitlines())])

    elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return mammoth.extract_raw_text(file).value

    else:
        raise ValueError("Unsupported file type")

