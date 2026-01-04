from pydantic import BaseModel, Field
from typing import List, Optional

class Party(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class InvoiceLine(BaseModel):
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    taxable_amount: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None


class TaxSummary(BaseModel):
    tax_type: Optional[str] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None


class BankDetails(BaseModel):
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc: Optional[str] = None
    bank_name: Optional[str] = None


class Invoice(BaseModel):
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    invoice_type: Optional[str] = None

    seller: Optional[Party] = None
    buyer: Optional[Party] = None

    place_of_supply: Optional[str] = None
    currency: Optional[str] = None

    line_items: List[InvoiceLine] = Field(default_factory=list)

    discounts: Optional[float] = None

    subtotal: Optional[float] = None
    taxes: Optional[List[TaxSummary]] = None
    total_tax: Optional[float] = None
    total_amount: Optional[float] = None

    amount_paid: Optional[float] = None
    amount_due: Optional[float] = None

    payment_method: Optional[str] = None
    bank_details: Optional[BankDetails] = None

    notes: Optional[str] = None
