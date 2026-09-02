from flask import Flask, jsonify
from flask_cors import CORS
from models import db, Product
from routes.products import products_bp
from routes.orders import orders_bp
from routes.auth import auth_bp
def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bakery.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)

    with app.app_context():
        db.create_all()
        if not Product.query.first():
            seed_products()

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "message": "Bakery API is running smoothly!"}), 200

    return app

def seed_products():
    sample_products = [
        Product(
            name="Sourdough Artisan Loaf",
            description="Crispy crust with a soft, tangy, fermented crumb.",
            price=6.50,
            category="bread",
            image_url="https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&q=80&w=600"
        ),
        Product(
            name="Buttery Croissant",
            description="Flaky, golden layers made with authentic French butter.",
            price=3.75,
            category="pastry",
            image_url="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600"
        ),
        Product(
            name="Velvet Chocolate Cake Slice",
            description="Rich chocolate sponge layered with smooth silky ganache.",
            price=5.25,
            category="cake",
            image_url="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600"
        ),
        Product(
            name="Berry Danish",
            description="Sweet pastry shell filled with vanilla custard and fresh seasonal berries.",
            price=4.50,
            category="pastry",
            image_url="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600"
        )
    ]
    db.session.bulk_save_objects(sample_products)
    db.session.commit()

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
