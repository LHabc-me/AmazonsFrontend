import { createRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const Board = forwardRef((props, ref) => {
  const {
    className,
    style,
    boardSize,
    initBlackChessPositions,
    initWhiteChessPositions,
    onClickGrid
  } = props;

  const [blackChessPositions, setBlackChessPositions] = useState(initBlackChessPositions);
  const [whiteChessPositions, setWhiteChessPositions] = useState(initWhiteChessPositions);
  const [arrowPositions, setArrowPositions] = useState([]);
  const [chessHintPositions, setChessHintPositions] = useState([]);
  const [arrowHintPositions, setArrowHintPositions] = useState([]);

  const boardWrapperRef = useRef(null);
  const boardRef = useRef(null);
  const gridRefs = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0).map(() => createRef()));
  const chesses = useRef(Array(initBlackChessPositions.length + initWhiteChessPositions.length).fill(0).map((_, index) => {
    const color = index < initBlackChessPositions.length ? "black" : "white";
    const position = color === "black" ? initBlackChessPositions[index] : initWhiteChessPositions[index - initBlackChessPositions.length];
    return {
      ref: createRef(),
      position,
      color
    };
  }));


  const movePiece = (from, to) => {
    const [fromX, fromY] = from;
    const [toX, toY] = to;
    adjustChessPosition(from, to);
    const chessColor = blackChessPositions.some(([x, y]) => x === fromX && y === fromY) ? "black" : whiteChessPositions.some(([x, y]) => x === fromX && y === fromY) ? "white" : null;
    if (chessColor === "black") {
      setBlackChessPositions(blackChessPositions.map(([x, y]) => x === fromX && y === fromY ? [toX, toY] : [x, y]));
    } else if (chessColor === "white") {
      setWhiteChessPositions(whiteChessPositions.map(([x, y]) => x === fromX && y === fromY ? [toX, toY] : [x, y]));
    }
  };

  const placeArrow = (position) => {
    setArrowPositions([...arrowPositions, position]);
  };

  const withDrawArrow = (position) => {
    setArrowPositions(arrowPositions.filter(([x, y]) => x !== position[0] || y !== position[1]));
  };

  const showChessHint = (positions) => {
    setChessHintPositions(positions);
  };

  const showArrowHint = (positions) => {
    setArrowHintPositions(positions);
  };

  useImperativeHandle(ref, () => ({
    movePiece,
    placeArrow,
    withDrawArrow,
    showChessHint,
    showArrowHint
  }));

  function handleBoardResize() {
    const gap = 0;
    if (boardWrapperRef.current) {
      let width = boardWrapperRef.current.clientWidth > boardWrapperRef.current.clientHeight ? boardWrapperRef.current.clientHeight : boardWrapperRef.current.clientWidth;
      width -= gap;
      boardRef.current.style.width = `${width}px`;
      boardRef.current.style.height = `${width}px`;
    }
    chesses.current.forEach(chess => {
      adjustChessPosition(chess.position, chess.position, false);
    });
  }

  function adjustChessPosition(from, to, useTransition = true) {
    const [fromX, fromY] = from;
    const [toX, toY] = to;
    const chessIndex = chesses.current.findIndex(chess => {
      const [x, y] = chess.position;
      return x === fromX && y === fromY;
    });
    if (chessIndex === -1) {
      return;
    }
    const chess = chesses.current[chessIndex];
    const grid = gridRefs[toX][toY].current.getBoundingClientRect();
    const ratio = 5 / 6;
    chess.ref.current.style.left = `${grid.left + grid.width * (1 - ratio) / 2}px`;
    chess.ref.current.style.top = `${grid.top + grid.height * (1 - ratio) / 2}px`;
    chess.ref.current.style.width = `${grid.width * ratio}px`;
    chess.ref.current.style.height = `${grid.height * ratio}px`;
    // 平滑移动，无弹跳
    if (useTransition) {
      chess.ref.current.style.transition = "left 0.5s, top 0.5s";
    } else {
      chess.ref.current.style.transition = "none";
    }
    chess.position = [toX, toY];
  }


  // 保证棋盘的宽高比为1:1
  useEffect(() => {
    handleBoardResize();
  }, [boardWrapperRef.current]);

  // 监听窗口大小变化，调整棋盘大小
  useEffect(() => {
    window.addEventListener("resize", handleBoardResize);
    return () => {
      window.removeEventListener("resize", handleBoardResize);
    };
  }, []);

  // 设置棋子初始位置
  useEffect(() => {
    chesses.current.forEach(chess => adjustChessPosition(chess.position, chess.position));
  }, [gridRefs]);

  return (
    <div className={className} style={style}>
      <div className="w-full h-full flex flex-row justify-center items-center"
           ref={boardWrapperRef}>
        <div className={`grid bg-gray-50`}
             style={{
               gridTemplateColumns: `repeat(${boardSize + 2}, 1fr)`,
               gridTemplateRows: `repeat(${boardSize + 2}, 1fr)`
             }}
             ref={boardRef}>
          {
            chesses.current.map((chess, index) => (
              <div className={"rounded-full pointer-events-none absolute"}
                   ref={chess.ref}
                   key={index}
                   style={{
                     backgroundColor: chess.color,
                     boxShadow: "black 0px 0px 3px"
                   }} />
            ))
          }
          {
            Array(boardSize + 2)
              .fill(0)
              .map((_, index) => (
                <div key={index}
                     className="flex justify-center items-center text-lg"
                     style={{
                       gridRow: 1,
                       gridColumn: index
                     }}>
                  {index > 1 && String.fromCharCode(65 + index - 2)}
                </div>
              ))
          }
          {
            Array(boardSize + 2)
              .fill(0)
              .map((_, index) => (
                <div key={index}
                     className="flex justify-center items-center text-lg"
                     style={{
                       gridRow: index,
                       gridColumn: 1
                     }}>
                  {index > 1 && boardSize - index + 2}
                </div>
              ))
          }
          {
            Array(boardSize * boardSize)
              .fill(0)
              .map((_, index) => {
                const row = Math.floor(index / boardSize);
                const col = index % boardSize;
                const isChess = blackChessPositions.some(([x, y]) => x === col && y === row) || whiteChessPositions.some(([x, y]) => x === col && y === row);
                // const chessColor = blackChessPositions.some(([x, y]) => x === col && y === row) ? "black" : whiteChessPositions.some(([x, y]) => x === col && y === row) ? "white" : null;
                const isArrow = arrowPositions.some(([x, y]) => x === col && y === row);
                const isChessHint = chessHintPositions.some(([x, y]) => x === col && y === row);
                const isArrowHint = arrowHintPositions.some(([x, y]) => x === col && y === row);
                return (
                  <div key={index}
                       className="border border-gray-300 flex justify-center items-center"
                       style={{
                         gridRow: row + 2,
                         gridColumn: col + 2,
                         cursor: isChess ? "pointer" : "default"
                       }}
                       onClick={() => onClickGrid(col, row)}
                       ref={gridRefs[col][row]}>
                    {
                      // isChess && chessColor && (
                      //   <div className={"w-5/6 h-5/6 rounded-full cursor-pointer"}
                      //        style={{
                      //          backgroundColor: chessColor,
                      //          boxShadow: "black 0px 0px 3px"
                      //        }} />
                      // )
                    }
                    {
                      isArrow && (
                        <div className={"w-5/6 h-5/6 rounded-full bg-blue-700 fade-in"}
                             style={{
                               boxShadow: "black 0px 0px 3px"
                             }} />

                      )
                    }
                    {
                      isChessHint && (
                        <div className={"w-full h-full p-0.5"}>
                          <div style={{
                            width: "100%",
                            height: "100%",
                            transition: "transform cubic-bezier(.17, .67, .62, 1.32) 0.2s, box-shadow ease 0.2s",
                            boxShadow: "yellow 1px 1px 10px",
                            backgroundColor: "#ffffde",
                            cursor: "pointer"
                          }}></div>
                        </div>
                      )
                    }
                    {
                      isArrowHint && (
                        <div className={"w-full h-full p-0.5"}>
                          <div style={{
                            width: "100%",
                            height: "100%",
                            transition: "transform cubic-bezier(.17, .67, .62, 1.32) 0.2s, box-shadow ease 0.2s",
                            boxShadow: "red 1px 1px 10px",
                            backgroundColor: "#ffd2d2",
                            cursor: "pointer"
                          }}></div>
                        </div>
                      )
                    }
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
});

export default Board;
