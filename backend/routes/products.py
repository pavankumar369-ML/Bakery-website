from flask import Blueprint, jsonify, request
from models import Product

products_bp = Blueprint('products', __name__)

@products_bp.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    if category and category != 'all':
        products = Product.query.filter_by(category=category, is_available=True).all()
    else:
        products = Product.query.filter_by(is_available=True).all()
        
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "price": p.price,
        "category": p.category,
        "image_url": p.image_url
    } for p in products]), 200

@products_bp.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    p = Product.query.get_or_404(product_id)
    return jsonify({
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "price": p.price,
        "category": p.category,
        "image_url": p.image_url
    }), 200
