from app.database import SessionLocal, Base, engine
from app.models.complaint import Complaint

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        count = db.query(Complaint).count()
        if count > 0:
            print(f"Skipping seed: {count} complaints already exist.")
            return

        complaints_data = [
            {
                "complaint_source": "Pharmacy",
                "customer_name": "Apollo Pharmacy",
                "product_name": "Amoxicillin Capsules 500mg",
                "product_strength": "500mg",
                "batch_number": "AMX240501",
                "manufacturing_date": "2024-01-15",
                "expiry_date": "2026-01-14",
                "quantity_affected": "48 capsules",
                "complaint_type": "Physical",
                "complaint_date": "2024-05-10",
                "description": "Capsule discoloration (brown spots) noticed upon opening.",
                "severity": "Major",
                "priority": "High",
                "completeness_score": 85
            },
            {
                "complaint_source": "Healthcare Provider",
                "customer_name": "MedPlus Healthcare",
                "product_name": "Paracetamol Tablets 500mg",
                "product_strength": "500mg",
                "batch_number": "PCT240302",
                "manufacturing_date": "2024-03-01",
                "expiry_date": "2026-02-28",
                "quantity_affected": "200 tablets",
                "complaint_type": "Physical",
                "complaint_date": "2024-06-12",
                "description": "Tablet chipping and crumbling during dispensing.",
                "severity": "Minor",
                "priority": "Medium",
                "completeness_score": 85
            },
            {
                "complaint_source": "Hospital",
                "customer_name": "City Hospital Pharmacy",
                "product_name": "Ciprofloxacin IV Infusion 200mg/100ml",
                "product_strength": "200mg/100ml",
                "batch_number": "CIP240601",
                "manufacturing_date": "2024-05-20",
                "expiry_date": "2025-11-19",
                "quantity_affected": "5 bags",
                "complaint_type": "Physical",
                "complaint_date": "2024-07-05",
                "description": "Visible black particles in infusion bag.",
                "severity": "Critical",
                "priority": "Urgent",
                "completeness_score": 85
            },
            {
                "complaint_source": "Distributor",
                "customer_name": "National Drug Store",
                "product_name": "Metformin Tablets 500mg",
                "product_strength": "500mg",
                "batch_number": "MET240203",
                "manufacturing_date": "2024-02-01",
                "expiry_date": "2026-01-31",
                "quantity_affected": "1000 tablets",
                "complaint_type": "Labeling",
                "complaint_date": "2024-08-11",
                "description": "Incorrect label: shows 850mg instead of 500mg.",
                "severity": "Critical",
                "priority": "Urgent",
                "completeness_score": 85
            },
            {
                "complaint_source": "Distributor",
                "customer_name": "PharmaCare Distribution",
                "product_name": "Amoxicillin Capsules 500mg",
                "product_strength": "500mg",
                "batch_number": "AMX240489",
                "manufacturing_date": "2024-04-10",
                "expiry_date": "2026-04-09",
                "quantity_affected": "12 bottles",
                "complaint_type": "Packaging",
                "complaint_date": "2024-09-21",
                "description": "Leaking bottles during transport, moisture ingress.",
                "severity": "Major",
                "priority": "High",
                "completeness_score": 85
            }
        ]

        for data in complaints_data:
            complaint = Complaint(**data)
            db.add(complaint)
        
        db.commit()
        print("Successfully seeded 5 pharmaceutical complaints.")
    
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
