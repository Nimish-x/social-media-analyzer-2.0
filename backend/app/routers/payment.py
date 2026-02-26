"""
Stripe Payment Router.
Handles checkout session creation and payment verification.
"""

import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

from app.core.config import get_settings
from app.core.auth import get_current_user, TokenData
from app.services.user_service import user_service

router = APIRouter(prefix="/api/payment", tags=["Payment"])
settings = get_settings()

# Initialize Stripe
# Using the key from env directly or settings if mapped
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
stripe.api_key = STRIPE_SECRET_KEY

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173") # Fallback to Vite default if not set

class CheckoutRequest(BaseModel):
    plan_id: str

class VerifyRequest(BaseModel):
    session_id: str

PLAN_PRICES = {
    "professional": {
        "price_amount": 39900, # in cents (INR 399)
        "name": "Social Leaf Professional",
        "currency": "inr"
    },
    "business": {
        "price_amount": 79900, # in cents (INR 799)
        "name": "Social Leaf Business",
        "currency": "inr"
    }
}

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CheckoutRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a Stripe Checkout Session."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")

    plan_id = request.plan_id
    if plan_id not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan selected")

    plan_details = PLAN_PRICES[plan_id]

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=current_user.email,
            line_items=[{
                'price_data': {
                    'currency': plan_details['currency'],
                    'product_data': {
                        'name': plan_details['name'],
                        'description': f"Subscription for {plan_id} plan",
                    },
                    'unit_amount': plan_details['price_amount'],
                },
                'quantity': 1,
            }],
            mode='payment', # Using payment for one-time/dummy, usually 'subscription' for SaaS
            success_url=f"{FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/choose-plan",
            metadata={
                "user_id": current_user.user_id,
                "plan_id": plan_id
            }
        )
        return {"url": session.url}
    except Exception as e:
        print(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-session")
async def verify_session(
    request: VerifyRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """Verify payment session and update user plan."""
    try:
        session = stripe.checkout.Session.retrieve(request.session_id)
        
        if session.payment_status == 'paid':
            # Payment successful, update user plan
            plan_id = session.metadata.get("plan_id")
            user_id = session.metadata.get("user_id")
            
            # Verify the user matches (security check)
            if user_id != current_user.user_id:
                 raise HTTPException(status_code=403, detail="User mismatch")

            if plan_id:
                # Update user plan in DB
                await user_service.update_plan(user_id=user_id, plan=plan_id)
                return {"success": True, "plan": plan_id}
            else:
                 raise HTTPException(status_code=400, detail="Plan info missing in session")
        else:
            return {"success": False, "status": session.payment_status}
            
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
