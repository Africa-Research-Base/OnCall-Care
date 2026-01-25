import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const QUESTIONS = [
  {
    id: "who",
    question: "Who is affected?",
    options: ["Adult", "Child", "Infant", "Pregnant Person"],
  },
  {
    id: "conscious",
    question: "Is the person conscious?",
    options: ["Yes", "No"],
  },
  {
    id: "symptoms",
    question: "What is happening? (Select all that apply)",
    multiSelect: true,
    options: [
      "Breathing Difficulty",
      "Severe Bleeding",
      "Chest Pain",
      "Unconscious",
      "High Fever",
      "Broken Bone",
      "Allergic Reaction",
      "Seizure",
      "Other",
    ],
  },
  {
    id: "history",
    question: "Any known medical history?",
    inputType: "text",
    placeholder: "e.g. Asthma, Diabetes, Hypertension...",
  },
];

export default function TriageWizard({ onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ symptoms: [] });

  const handleOptionSelect = (option) => {
    const currentQ = QUESTIONS[step];

    if (currentQ.multiSelect) {
      const current = answers[currentQ.id] || [];
      const updated = current.includes(option)
        ? current.filter((i) => i !== option)
        : [...current, option];
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: option });
      if (step < QUESTIONS.length - 1) setStep(step + 1);
    }
  };

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    // Basic validation
    if (
      !answers.who ||
      !answers.conscious ||
      (answers.symptoms || []).length === 0
    ) {
      Alert.alert(
        "Incomplete",
        "Please answer all questions to help us find the right nurse.",
      );
      return;
    }

    const payload = {
      age_group: answers.who,
      is_conscious: answers.conscious === "Yes",
      symptoms: answers.symptoms || [],
      history_notes: answers.history || "",
    };

    onSubmit(payload);
  };

  const currentQ = QUESTIONS[step];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>
          Step {step + 1} of {QUESTIONS.length}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <Text style={styles.question}>{currentQ.question}</Text>

      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {currentQ.inputType === "text" ? (
          <TextInput
            style={styles.input}
            placeholder={currentQ.placeholder}
            multiline
            numberOfLines={4}
            value={answers[currentQ.id] || ""}
            onChangeText={(text) =>
              setAnswers({ ...answers, [currentQ.id]: text })
            }
          />
        ) : (
          currentQ.options.map((opt) => {
            const isSelected = currentQ.multiSelect
              ? (answers[currentQ.id] || []).includes(opt)
              : answers[currentQ.id] === opt;

            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionBtn,
                  isSelected && styles.optionBtnSelected,
                ]}
                onPress={() => handleOptionSelect(opt)}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep(step - 1)}
          >
            <Text style={{ color: "#555" }}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {step === QUESTIONS.length - 1 ? "FIND HELP NOW" : "NEXT"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  stepText: { color: "#888", fontWeight: "bold" },
  question: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
  },
  optionsContainer: { flex: 1 },
  optionBtn: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f5f6fa",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionBtnSelected: { backgroundColor: "#e74c3c" },
  optionText: { fontSize: 16, color: "#2c3e50" },
  optionTextSelected: { color: "white", fontWeight: "bold" },
  input: {
    backgroundColor: "#f5f6fa",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  backBtn: { padding: 15 },
  nextBtn: {
    backgroundColor: "#e74c3c",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  nextBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
