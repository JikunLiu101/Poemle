import { useGameState } from './hooks/useGameState';
import { sentenceIndex } from './data/sentenceIndex';
import { getDailyPuzzle, getRandomPuzzle } from './engine/puzzle';
import { LandingPage } from './pages/LandingPage';
import { GameBoard } from './pages/GameBoard';
import { GameOverPanel } from './pages/GameOverPanel';

const MAIN_CLS = 'min-h-screen max-w-3xl mx-auto px-4';

export default function App() {
  const { state, dispatch } = useGameState();

  if (!state) {
    return (
      <main className={MAIN_CLS}>
        <LandingPage
          onStartDaily={() =>
            dispatch({
              type: 'START_PUZZLE',
              mode: 'daily',
              record: getDailyPuzzle(sentenceIndex),
            })
          }
          onStartRandom={() =>
            dispatch({
              type: 'START_PUZZLE',
              mode: 'random',
              record: getRandomPuzzle(sentenceIndex),
            })
          }
        />
      </main>
    );
  }

  if (state.gameOver) {
    return (
      <main className={MAIN_CLS}>
        <GameOverPanel
          state={state}
          onNewRandomGame={() => {
            dispatch({ type: 'RESET' });
            dispatch({
              type: 'START_PUZZLE',
              mode: 'random',
              record: getRandomPuzzle(sentenceIndex),
            });
          }}
          onBackToLanding={() => dispatch({ type: 'RESET' })}
        />
      </main>
    );
  }

  return (
    <main className={MAIN_CLS}>
      <GameBoard state={state} dispatch={dispatch} />
    </main>
  );
}
