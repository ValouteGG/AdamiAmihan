import './page.css'

export default function CreateRoom(){
  return (
    <div className="page-root">
      <div className="page-inner">
        <h2>Create a study room</h2>
        <p>Create a private room, invite classmates, and start collaborating right away.</p>
        <form className="form">
          <label>Room name
            <input placeholder="e.g. Calculus study group" />
          </label>
          <label>Visibility
            <select>
              <option>Private</option>
              <option>Public</option>
            </select>
          </label>
          <div className="actions">
            <button className="btn primary">Create room</button>
            <a href="#/" className="btn ghost">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  )
}
