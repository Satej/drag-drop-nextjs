"""insert initial data into documents table

Revision ID: b8a7ab036ede
Revises: eebf250df7db
Create Date: 2024-10-08 22:54:15.419903

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from models import Document


# revision identifiers, used by Alembic.
revision: str = 'b8a7ab036ede'
down_revision: Union[str, None] = 'eebf250df7db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Insert initial data into the documents table
    op.bulk_insert(
        Document.__table__,
        [
            {'type': 'bank-draft', 'title': 'Bank Draft', 'position': 0},
            {'type': 'bill-of-lading', 'title': 'Bill of Lading', 'position': 1},
            {'type': 'invoice', 'title': 'Invoice', 'position': 2},
            {'type': 'bank-draft-2', 'title': 'Bank Draft 2', 'position': 3},
            {'type': 'bill-of-lading-2', 'title': 'Bill of Lading 2', 'position': 4},
        ]
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("DELETE FROM documents WHERE type IN ('bank-draft', 'bill-of-lading', 'invoice', 'bank-draft-2', 'bill-of-lading-2')")
    )
