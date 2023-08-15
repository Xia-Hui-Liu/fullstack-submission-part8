import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_AUTHOR } from "../queries";

export const UpdateAuthor = ({ authors }) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [changeBornYear, result] = useMutation(UPDATE_AUTHOR);

  useEffect(() => {
    if (result.data && result.data.editAuthor === null) {
      setError("Person not found");
    } else {
      setError("");
    }
  }, [result.data]);

  const submit = async () => {
   
    if (!name) {
      setError("Please select an author");
      return;
    }

    if (!born) {
      setError("Please enter a valid birth year");
      return;
    }

    changeBornYear({ variables: { name, setBornTo: parseInt(born) } });
    setBorn("");
    setSuccessMessage("Birth year updated successfully!");
  };

  return (
    <div>
      <h2>Set Birth Year</h2>
      <form onSubmit={submit}>
        <label>
          Author:
          <select name="name" value={name} onChange={(event) => setName(event.target.value)}>
            <option value="">Select an author</option>
            {authors.map((author, index) => (
              <option key={index} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          Born:
          <input
            type="number"
            value={born}
            onChange={(event) => setBorn(event.target.value)}
          />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {successMessage && <div style={{ color: "green" }}>{successMessage}</div>}
        <button type="submit" disabled={result.loading}>Update Author</button>
      </form>
    </div>
  );
};


