# Use an official Python runtime as a parent image
FROM python:3.9


# Copy the script and dependencies into the container
COPY well-known-crawl.py .
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Command to run the script
CMD ["python", "well-known-crawl.py"]
