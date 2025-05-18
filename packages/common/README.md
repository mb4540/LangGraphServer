# LangGraph Schemas (common package)

This package contains the shared Pydantic models for the LangGraph Workflow Builder project.

It defines the structure for graph nodes, edges, and the overall graph representation.

## Usage

This package is intended to be used by other packages in the monorepo, such as the `backend` service.

To install it in another Python project within this monorepo (e.g., from `apps/backend`):

```bash
# Assuming you are in apps/backend
# Add this line to your requirements.txt:
# -e ../../packages/common
# Then install:
pip install -r requirements.txt
```
