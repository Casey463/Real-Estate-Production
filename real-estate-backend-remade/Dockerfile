# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory to /app
WORKDIR /app

# Copy requirements.txt into the container at /app
COPY requirements.txt .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the remaining files directory 
COPY . .

# Make port 8000 available to the outside world
EXPOSE 8000

# Define environment variable
ENV DJANGO_SETTINGS_MODULE backend.settings

RUN python manage.py 
# Run manage.py when the container launches
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]