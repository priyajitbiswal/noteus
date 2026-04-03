"""Pydantic models for REST request / response bodies."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentCreate(BaseModel):
    title: str = "Untitled Document"


class DocumentOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime


class DocumentDetail(DocumentOut):
    pass


class TitleUpdate(BaseModel):
    title: str


class RevisionOut(BaseModel):
    id: str
    doc_id: str
    author: Optional[str]
    description: Optional[str]
    created_at: datetime


class RevisionCreate(BaseModel):
    author: str = ""
    description: str = ""
