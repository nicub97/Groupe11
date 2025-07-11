import { useState } from "react";
import PropTypes from "prop-types";

// Formulaire simple pour ajouter un créneau de disponibilité
export default function PlanningForm({ onSubmit }) {
  const [values, setValues] = useState({ date: "", heure_debut: "", heure_fin: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (values.heure_debut && values.heure_fin && values.heure_debut >= values.heure_fin) {
      setError("L'heure de début doit être avant l'heure de fin.");
      return;
    }
    setError("");
    if (onSubmit) {
      onSubmit({ ...values });
    }
    setValues({ date: "", heure_debut: "", heure_fin: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        type="date"
        name="date"
        value={values.date}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <div className="flex gap-2">
        <input
          type="time"
          name="heure_debut"
          value={values.heure_debut}
          onChange={handleChange}
          required
          className="flex-1 p-2 border rounded"
        />
        <input
          type="time"
          name="heure_fin"
          value={values.heure_fin}
          onChange={handleChange}
          required
          className="flex-1 p-2 border rounded"
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        Ajouter
      </button>
    </form>
  );
}

PlanningForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
