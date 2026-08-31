from flask import Blueprint, jsonify, request
from models import db, Order, OrderItem, Product

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    
    # Expected payload:
    # {
    #   "user_id": 1,
    #   "delivery_address": "123 Sweet Street",
    #   "delivery_time": "Tomorrow, 2:00 PM",
    #   "items": [{"product_id": 1, "quantity": 2}, ...]
    # }
    
    if not data or not data.get('items') or not data.get('delivery_address'):
        return jsonify({"error": "Invalid order data provided."}), 400

    items = data.get('items')
    total_amount = 0.0
    calculated_items = []

    for item in items:
        product = Product.query.get(item['product_id'])
        if not product or not product.is_available:
            return jsonify({"error": f"Product ID {item['product_id']} not available."}), 400
        
        subtotal = product.price * item['quantity']
        total_amount += subtotal
        calculated_items.append({
            "product_id": product.id,
            "quantity": item['quantity'],
            "price": product.price
        })

    # Create Order
    new_order = Order(
        user_id=data.get('user_id', 1), # Default mock user if not supplied
        total_amount=total_amount,
        delivery_address=data.get('delivery_address'),
        delivery_time=data.get('delivery_time', 'ASAP'),
        status='Order Received'
    )
    db.session.add(new_order)
    db.session.commit()

    # Create Order Items
    for ci in calculated_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=ci['product_id'],
            quantity=ci['quantity'],
            price=ci['price']
        )
        db.session.add(order_item)
    
    db.session.commit()

    return jsonify({
        "message": "Order successfully placed!",
        "order_id": new_order.id,
        "total_amount": total_amount,
        "status": new_order.status
    }), 201

@orders_bp.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    
    items = [{
        "product_name": item.product.name,
        "quantity": item.quantity,
        "price": item.price
    } for item in order.items]

    return jsonify({
        "order_id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "delivery_address": order.delivery_address,
        "delivery_time": order.delivery_time,
        "created_at": order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "items": items
    }), 200

@orders_bp.route('/api/orders/<int:order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    """Admin route to progress order delivery lifecycle."""
    order = Order.query.get_or_404(order_id)
    data = request.json
    
    new_status = data.get('status')
    valid_statuses = ['Order Received', 'Baking / Preparing', 'Out for Delivery', 'Delivered']
    
    if new_status not in valid_statuses:
        return jsonify({"error": "Invalid status value."}), 400
        
    order.status = new_status
    db.session.commit()
    
    return jsonify({
        "message": f"Order #{order.id} status updated successfully.",
        "status": order.status
    }), 200
