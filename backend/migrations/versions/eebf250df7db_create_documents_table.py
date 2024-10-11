"""create documents table

Revision ID: eebf250df7db
Revises:
Create Date: 2024-10-08 22:43:49.497385

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eebf250df7db'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('type', sa.String(length=50), unique=True, nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('position', sa.Integer, nullable=False),
    )

def downgrade() -> None:
    op.drop_table('documents')
