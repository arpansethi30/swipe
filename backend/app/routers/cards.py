from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..models.database import get_db
from ..models.models import Card, CardReward
from ..models.schemas import Card as CardSchema, CardCreate

router = APIRouter(
    prefix="/cards",
    tags=["cards"],
    responses={404: {"description": "Not found"}}
)

@router.get("/", response_model=List[CardSchema])
def get_all_cards(db: Session = Depends(get_db)):
    return db.query(Card).all()

@router.get("/{card_id}", response_model=CardSchema)
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

@router.post("/", response_model=CardSchema)
def create_card(card: CardCreate, db: Session = Depends(get_db)):
    db_card = Card(
        name=card.name,
        issuer=card.issuer,
        last_four=card.last_four,
        annual_fee=card.annual_fee,
        image_url=card.image_url
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    
    # Add rewards
    for reward in card.rewards:
        db_reward = CardReward(
            card_id=db_card.id,
            category=reward.category,
            reward_percentage=reward.reward_percentage
        )
        db.add(db_reward)
    
    db.commit()
    db.refresh(db_card)
    return db_card 