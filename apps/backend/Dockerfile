# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the shared common package first
# This assumes the Docker build context is the monorepo root, 
# or that these paths are adjusted if context is apps/backend.
# For simplicity with editable installs, let's copy relevant parts of the monorepo.

# Create directories for apps and packages
RUN mkdir -p /app/apps/backend && mkdir -p /app/packages/common

# Copy the common package
COPY ../../packages/common /app/packages/common

# Copy the backend application code and requirements
COPY . /app/apps/backend

# Set working directory to the backend app
WORKDIR /app/apps/backend

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable for the Uvicorn command (optional, can be overridden)
ENV MODULE_NAME main
ENV VARIABLE_NAME app

# Run app.py when the container launches
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
