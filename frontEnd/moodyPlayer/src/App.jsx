
import { useState } from 'react';
import FacialExpression from './components/FacialExpression'
import MoodSongs from './components/MoodSongs'

const App = () => {
   const [song, setSong] = useState([]);
  return (
    <>
    <FacialExpression setSong={setSong} />
    <MoodSongs song={song}/>
    </>
  )
}

export default App