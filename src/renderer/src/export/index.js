function exportMatchDetail(info, details, outputPath) {
  let winner;
  if (info.winner) {
    winner = info.winner === info.first_team ? "先手胜" : "后手胜";
  }
  let meta_data = `[AM][${info.first_team}][${info.second_team}][${winner}][${info.time.toLocaleString()} ${info.location}][${info.name}]`;
  meta_data = meta_data.replaceAll("\\", ".").replaceAll("/", ".").replaceAll(":", ".");
  const file_name = meta_data + ".txt";
  const first_line = "#" + meta_data;
  let file_content = first_line + "\n";

  for (let i = 0; i < details.length; i++) {
    const detail = details[i];
    const from = translateCoordinate(detail.from_x, detail.from_y, info.board_size);
    const to = translateCoordinate(detail.to_x, detail.to_y, info.board_size);
    const arrow = translateCoordinate(detail.arrow_x, detail.arrow_y, info.board_size);
    if (i % 2 === 0) {
      file_content += `${Math.floor(i / 2) + 1} ${from}${to}(${arrow})`;
    } else {
      file_content += ` ${from}${to}(${arrow})\n`;
    }
  }
  return {
    outputPath,
    file_name,
    file_content
  };
}


function translateCoordinate(x, y, borderSize) {
  return `${String.fromCharCode("a".charCodeAt(0) + x)}${borderSize - y}`;
}

export { exportMatchDetail, translateCoordinate };
