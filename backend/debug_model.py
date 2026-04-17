import tensorflow as tf
import os

MODEL_PATH = '../hybrid_finetuned.keras'
print("Attempting to load model...")
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded!")
    model.summary()
except Exception as e:
    print(f"FAILED: {e}")
