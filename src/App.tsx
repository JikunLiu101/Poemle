import { useGameState } from './hooks/useGameState';
import { sentenceIndex } from './data/sentenceIndex';
import { getDailyPuzzle, getRandomPuzzle } from './engine/puzzle';
import { CornerDecoration } from './components/CornerDecoration';
import { LandingPage } from './pages/LandingPage';
import { GameBoard } from './pages/GameBoard';
import { GameOverPanel } from './pages/GameOverPanel';

const MAIN_CLS = 'relative z-10 min-h-screen max-w-3xl mx-auto px-4';

export default function App() {
  const { state, dispatch } = useGameState();

  if (!state) {
    return (
      <>
        <CornerDecoration />
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
      </>
    );
  }

  if (state.gameOver) {
    return (
      <>
        <CornerDecoration />
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
      </>
    );
  }

  return (
    <>
      <CornerDecoration />
      <main className={MAIN_CLS}>
        <GameBoard state={state} dispatch={dispatch} />
      </main>
    </>
  );
}
