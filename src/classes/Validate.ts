const dictionary = require('word-list-json'); // no @types file
import TileInfo from '../classes/TileInfo';
import Board from './Board';

export default class Validate {

    board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    /**
     * Travels horizontally through the board, calling callback on every space is passes through.
     *  Goes until `callback` returns false
     *
     * @param startCoordinate - coordinate to start from
     * @param callback - gets called on every coordinate
     * @param forwards - whether to travel left-right or right-left
     *
     * @return last coordinate callback returned `true` on
     */
    travelHorizontally(startCoordinate: number[],
                       callback: (tileInfo: TileInfo, currentCoordinate: number[]) => boolean,
                       forwards: boolean = true): typeof startCoordinate {

        let x = startCoordinate[1];
        let y = startCoordinate[0];

        while (this.getTileInfo([y, x])) {

            if (!callback(this.getTileInfo([y, x]), [y, x])) {
                break;
            }

            forwards ? x++ : x--;
        }

        return [y, x + 1];
    }

    /**
     * Travels vertically through the board, calling callback on every space is passes through.
     *  Goes until `callback` returns false
     *
     * @param startCoordinate - coordinate to start from
     * @param callback - gets called on every coordinate
     * @param up - whether to travel up-down or down-up
     *
     * @return last coordinate callback returned `true` on
     */

    travelVertically(startCoordinate: number[],
                     callback: (tileInfo: TileInfo, currentCoordinate: number[]) => boolean,
                     up: boolean = true): typeof startCoordinate {

        let x = startCoordinate[1];
        let y = startCoordinate[0];

        while (this.getTileInfo([y, x])) {

            if (!callback(this.getTileInfo([y, x]), [y, x])) {
                break;
            }

            up ? y++ : y--;
        }

        return [y + 1, x];
    }

    /**
     * Checks if tiles are placed in a valid manner (straight horizontal or vertical)
     *
     * @param coordinates - 2d array of coordinates of tiles. Must be left to right
     */
    checkTilePlacementValidity(coordinates: number[][]) {

        if (!this.checkForCenterTile(coordinates[0])) {
            console.log('no center');
            return false;
        }

        /**
         * Travels validateVertically through the board, starting at firstCoordinate
         *
         * @param firstCoordinate - The first coordinate to start checking by
         *
         * @return boolean if all tiles in coordinates (param of checkTilePlacementValidity) is covered
         *  in the travels
         */
        const validateVertically = (firstCoordinate: number[]) => {

            const coordinatesNotTouched = [...coordinates];

            this.travelVertically(firstCoordinate, (tileInfo, currentCoordinate) => {

                if (tileInfo.recent) {

                    const recentCoordinateIdx = coordinatesNotTouched.findIndex((coordinate) =>
                      coordinate[0] === currentCoordinate[0] && coordinate[1] === firstCoordinate[1]);

                    if (recentCoordinateIdx !== -1) {
                        coordinatesNotTouched.splice(recentCoordinateIdx, 1);
                    }
                }

                return tileInfo.filled;
            });

            return !coordinatesNotTouched.length;
        };

        /**
         * Travels horizontally through the board, starting at firstCoordinate
         *
         * @param firstCoordinate - The first coordinate to start checking by
         *
         * @return boolean if all tiles in coordinates (param of checkTilePlacementValidity) is covered
         *  in the travels
         */
        const validateHorizontally = (firstCoordinate: number[]) => {

            const coordinatesNotTouched = [...coordinates];

            this.travelHorizontally(firstCoordinate, (tileInfo, currentCoordinate) => {

                if (tileInfo.recent) {

                    const recentCoordinateIdx = coordinatesNotTouched.findIndex((coordinate) =>
                        coordinate[1] === currentCoordinate[1] && coordinate[0] === firstCoordinate[0]);

                    if (recentCoordinateIdx !== -1) {
                        coordinatesNotTouched.splice(recentCoordinateIdx, 1);
                    }
                }

                return tileInfo.filled;
            });

            return !coordinatesNotTouched.length;
        };

        console.log('vertical', validateVertically(coordinates[0]), 'horizontal', validateHorizontally(coordinates[0]));
        return validateVertically(coordinates[0]) || validateHorizontally(coordinates[0]);
    }

    /**
     * Checks if recent tiles form valid words with all tiles it touches
     */
    validateWords(coordinates: number[][]) {

        return this.getWords(coordinates).every(tileInfoArr => {

            const word = tileInfoArr
                .map((tileInfo => tileInfo.tile!.letter))
                .join('');

            return dictionary.includes(word.toLowerCase());
        });
    }

    /**
     *
     * @param coordinates - where to start
     *
     * @return 2d array with all tiles that connect to `coordinates`, 1 "word" per inner array
     */
    getWords(coordinates: number[][]): TileInfo[][] {

        /**
         * @return the y coordinate of the highest tile that connect to coordinateToCheck
         */
        const getHighestX = (coordinateToCheck: typeof coordinates[0]) => {

            const rightmostCoordinate = this.travelHorizontally(coordinateToCheck, tileInfo => tileInfo.filled, false);
            return rightmostCoordinate;
        };

        /**
         * @return the y coordinate of the highest tile that connect to coordinateToCheck
         */
        const getHighestY = (coordinateToCheck: typeof coordinates[0]) => {

            const highestCoordinate = this.travelVertically(coordinateToCheck, tileInfo => tileInfo.filled, false);

            return highestCoordinate;
        };

        /**
         * Given a coordinate, this checks if it's part of a valid vertical word
         */
        const getVerticalWord = (coordinate: number[]) => {

            let word: TileInfo[] = [];

            this.travelVertically(coordinate, tileInfo => {

                if (!tileInfo.filled) {
                    return false;
                }

                word.push(tileInfo);

                return true;
            });

            return word;
        };

        /**
         * Given a coordinate, this checks if it's part of a valid vertical word
         */
        const getHorizontalWord = (coordinate: number[]) => {

            let word: TileInfo[] = [];

            this.travelHorizontally(coordinate, tileInfo => {

                if (!tileInfo.filled) {
                    return false;
                }

                word.push(tileInfo);

                return true;
            });

            return word;
        };

        type reductionParam = { previousX: number[], previousY: number[], words: TileInfo[][] };

        return coordinates.reduce((accum: reductionParam, coordinate) => {

            const highestX = getHighestX(coordinate);
            const highestY = getHighestY(coordinate);

            const verticalWord = getVerticalWord(highestY);
            const horizontalWord = getHorizontalWord(highestX);

            const sameXWordAsBefore = accum.previousX[0] === highestX[0] && accum.previousX[1] === highestX[1];
            const sameYWordAsBefore = accum.previousY[0] === highestY[0] && accum.previousY[1] === highestY[1];

            if (!sameYWordAsBefore && verticalWord.length > 1) {
                accum.words = accum.words.concat([verticalWord]);
            }
            if (!sameXWordAsBefore && horizontalWord.length > 1) {
                accum.words = accum.words.concat([horizontalWord]);
            }

            accum.previousX = highestX;
            accum.previousY = highestY;

            return accum;
        },                        {previousX: [-1, -1], previousY: [-1, -1], words: [] as any}).words;
    }

    /**
     * Checks if center spot on board is filled (all tiles must emenate from center)
     */
    checkForCenterTile(currentCoordinates: number[]) {

        const centerCoordinates = [7, 7];

        const centerIsFilled = this.board.get(centerCoordinates)!.filled;

        if (!centerIsFilled) {
            console.log('center not filled');
            return false;
        }

        // so recursion in checkTileTree doesn't go on forever. Must be string since can't use arrays in Set
        const coordinatesTried = new Set<string>();

        /**
         * Recursively checks all paths from `currentCoordinates` until it finds the center tile
         *
         * @return boolean if `currentCoordinates` somehow connects to the center of the board
         */
        const checkTileTree = (coordinates: number[]): boolean => {

            const space = this.board.get(coordinates);

            if (coordinates[0] === coordinates[1] && coordinates[0] === 7) {
                console.log('center is here');
                return true;
            }

            if (space && space.filled && !coordinatesTried.has(coordinates.toString())) {

                coordinatesTried.add(coordinates.toString());

                return checkTileTree([coordinates[0] + 1, coordinates[1]]) ||
                    checkTileTree([coordinates[0], coordinates[1] + 1]) ||
                    checkTileTree([coordinates[0] - 1, coordinates[1]]) ||
                    checkTileTree([coordinates[0], coordinates[1] - 1]);
            }

            return false;
        };

        return checkTileTree(currentCoordinates);
    }

    getTileInfo(coordinates: number[]) {
        return this.board.get(coordinates) || new TileInfo();
    }

}