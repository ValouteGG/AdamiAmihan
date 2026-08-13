import './page.css'

export default function BrowseRooms(){
  return (
    <div className="page-root">
      <div className="page-inner">
        <h2>Browse public rooms</h2>
        <p>Discover active study sessions and join public rooms of interest.</p>
        <ul className="rooms-list">
          <li className="room">Calculus 101 • 8 participants <button className="btn">Join</button></li>
          <li className="room">Organic Chem • 3 participants <button className="btn">Join</button></li>
          <li className="room">History study • 12 participants <button className="btn">Join</button></li>
        </ul>
        <a href="#/" className="btn ghost">Back home</a>
      </div>
    </div>
  )
}
