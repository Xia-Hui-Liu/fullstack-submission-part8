import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { EDIT_AUTHOR } from "../queries";

const EditAuthor = ({ authors }) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState(null);
  const [error, setError] = useState("");

  const [changeBornYear, result] = useMutation(EDIT_AUTHOR);

  useEffect(() => {
    if (result.data && result.data.editAuthor === null) {
      setError("person not found");
    }
  }, [result.data]);

  const submit = async () => {
    changeBornYear({ variables: { name, setBornTo: born } });
    setBorn(null);
  };

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <label>
          name
          <select name="name" value={name} onChange={(event) => setName(event.target.value)}>
            {authors.map((author, index) => (
              <option key={index} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          born
          <input
            type="number"
            value={born === null ? "" : born}
            onChange={({ target }) => setBorn(target.value === "" ? null : parseInt(target.value))}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default EditAuthor;
