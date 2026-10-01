from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

# Allow your Node.js server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict this in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and supporting files once at startup
model = joblib.load("model.pkl")
feature_cols = joblib.load("feature_cols.pkl")
training_df = joblib.load("training_df.pkl")

feature_labels = {
    "python": "Python proficiency",
    "sql": "SQL proficiency",
    "math": "Math aptitude",
    "java_oop": "OOP / software design skill",
    "networking": "Networking / systems knowledge",
    "stats": "Statistics knowledge",
    "ai_interest": "Interest in AI",
    "web_interest": "Interest in web development",
    "data_interest": "Interest in data analysis",
    "cloud_interest": "Interest in cloud platforms",
    "security_interest": "Interest in security",
    "dl_interest": "Interest in deep learning",
    "db_interest": "Interest in databases",
    "se_interest": "Interest in software engineering",
}

course_key_features = {
    "Machine Learning": ["python", "math", "stats", "ai_interest"],
    "Deep Learning": ["python", "math", "stats", "dl_interest", "ai_interest"],
    "Data Analytics": ["sql", "stats", "math", "data_interest"],
    "Database Management": ["sql", "java_oop", "db_interest"],
    "Web Development": ["python", "java_oop", "web_interest"],
    "Software Engineering": ["java_oop", "python", "se_interest"],
    "Cloud Computing": ["networking", "java_oop", "cloud_interest"],
    "Cyber Security": ["networking", "math", "security_interest"],
}


class StudentProfile(BaseModel):
    python: int
    sql: int
    math: int
    java_oop: int
    networking: int
    stats: int
    ai_interest: int
    web_interest: int
    data_interest: int
    cloud_interest: int
    security_interest: int
    dl_interest: int
    db_interest: int
    se_interest: int


def explain_recommendation(course, student_row):
    reasons = []
    key_feats = course_key_features.get(course, [])
    for feat in key_feats:
        value = student_row[feat].values[0]
        label = feature_labels[feat]
        if feat.endswith("_interest"):
            if value == 1:
                reasons.append(f"You expressed interest in this area ({label.lower()})")
        else:
            if value >= 2:
                level = "strong" if value == 3 else "moderate"
                reasons.append(f"{level.capitalize()} {label.lower()} (level {value}/3)")
    if not reasons:
        reasons.append("Matched based on overall profile pattern")
    return reasons


def get_skill_gap(course, student_row):
    skill_features = [f for f in feature_cols if not f.endswith("_interest")]
    course_avg = training_df[training_df["recommended_course"] == course][skill_features].mean()
    student_vals = student_row[skill_features].iloc[0]

    gaps = []
    for feat in skill_features:
        diff = course_avg[feat] - student_vals[feat]
        if diff >= 0.5:
            gaps.append({
                "skill": feature_labels[feat],
                "your_level": int(student_vals[feat]),
                "typical_level": round(float(course_avg[feat]), 1),
                "gap": round(float(diff), 1)
            })
    return sorted(gaps, key=lambda x: x["gap"], reverse=True)


@app.get("/")
def root():
    return {"status": "ML recommendation API is running"}


@app.post("/predict")
def predict(profile: StudentProfile):
    student_df = pd.DataFrame([profile.dict()])[feature_cols]

    probs = model.predict_proba(student_df)[0]
    classes = model.classes_
    ranked = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)[:3]

    results = []
    for course, prob in ranked:
        results.append({
            "course": course,
            "confidence": round(float(prob) * 100, 2),
            "reasons": explain_recommendation(course, student_df),
            "skill_gaps": get_skill_gap(course, student_df)
        })

    return {"recommendations": results}