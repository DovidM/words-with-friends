import incrementTurn from './incrementTurn';
import initializeBoard from './initializeBoard';
import initializePlayers from './initializePlayers';
import putTileOnBoard from './putTileOnBoard';
import removeTileFromBoard from './removeTileFromBoard';
import putTileInHand from './putTileInHand';
import removeTileFromHand from './removeTileFromHand';
import createTilebag from './createTilebag';
import setScore from './setScore';
import clearRecentStatusFromBoard from './clearRecentStatusFromBoard';

export default {
    incrementTurn,
    changePlayer: incrementTurn,
    initializeBoard,
    putTileOnBoard,
    putTileInHand,
    removeTileFromHand,
    removeTileFromBoard,
    initializePlayers,
    createTilebag,
    setScore,
    clearRecentStatusFromBoard
};
