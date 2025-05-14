# Use official Python image
FROM python:alpine

# Set working directory
WORKDIR /app

# Copy requirements if present
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Run the bot
CMD ["python", "bot.py"]