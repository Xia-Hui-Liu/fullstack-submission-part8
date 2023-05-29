import { useQuery } from "@apollo/client"
import { ALL_AUTHORS } from "../queries"
import EditAuthor  from "./EditAuthor"

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)

  if (result.loading) {
    return <div>Loading authors...</div>
  }

  if (!props.show || !result.data) {
    return null
  }

  const authors = result.data.allAuthors
 
  return (
    <>
      <div>
        <h2>Authors</h2>
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Born</th>
              <th>Books</th>
            </tr>
            {authors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <EditAuthor authors={authors}/>
      </div>
    </>
    
    
  )
}

export default Authors
