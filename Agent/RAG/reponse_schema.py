from pydantic import BaseModel, Field

class invoiceData(BaseModel):
    invoice_id: str
    url : str

class ResponseSchema(BaseModel):
    status : bool  # success or failure
    message : str  # summary message
    lists : list[invoiceData] = Field(default_factory=list)  # list of invoice_id and url


class requestSchema(BaseModel):
    invoice_id : str