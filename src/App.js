import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import teamsData from "./teams.json";
const API_URL = "https://www.cricbuzz.com/api/cricket-match/commentary/";

function useInterval(callback, delay) {
  const savedCallback = useRef();
  const intervalId = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      intervalId.current = setInterval(tick, delay);
      return () => clearInterval(intervalId.current);
    }
  }, [delay]);

  return [intervalId.current];
}

const TestCricketLiveScoreComponent = ({ liveScores, matchInfo }) => {
  return <div>Test Cricket Live</div>;
};

const TestCricketCompleteScoreComponent = ({ liveScores, matchInfo }) => {
  return <div>Test Cricket Complete</div>;
};

const ODICricketLiveScoreComponent = ({ liveScores, matchInfo }) => {
  return (
    <div>
      ODI Live
    </div>
  )
}

const ODICricketCompleteScoreComponent = ({ liveScores, matchInfo }) => {
  return <div>ODI Complete</div>;
}

const T20CricketLiveScoreComponent = ({ liveScores, matchInfo }) => {
  return (
    <div>
      T20 Live
    </div>
  );
}

const T20CricketCompleteScoreComponent = ({ liveScores, matchInfo }) => {
  return <div>T20 Complete</div>;
}

const DefaultCricketLiveScoreComponent = ({
  liveScores,
  matchInfo,
  removeFromFollowList,
  intervalId,
}) => {
  return (
    <div style={{ marginLeft: 15, marginRight: 15 }}>
      <div className="cricket-card">
        <div className="cricket-card-title-wrapper">
          <div className="cricket-card-title">
            {teamsData[matchInfo?.team1Id]?.flag !== "" && (
              <img
                src={teamsData[matchInfo?.team1Id]?.flag}
                width={25}
                height={18}
                alt="Flag"
              />
            )}
            &nbsp;
            {matchInfo?.team1Name} vs &nbsp;
            {teamsData[matchInfo?.team2Id]?.flag !== "" && (
              <>
                <img
                  src={teamsData[matchInfo?.team2Id]?.flag}
                  width={25}
                  height={18}
                  alt="Flag"
                />
                &nbsp;
              </>
            )}
            {matchInfo?.team2Name}
          </div>
          <div className={`cricket-card-format ${matchInfo?.matchFormat}`}>
            {matchInfo?.matchFormat}
          </div>
        </div>
        <div className="cricket-card-subtitle">{matchInfo?.seriesName}</div>
        <div className="cricket-card-body">
          <div className="cricket-card-toss">
            <span className="cricket-card-toss-title">Toss:</span>
            {matchInfo?.tossWinner
              ? matchInfo?.tossWinner + "(" + matchInfo?.tossDecision + ")"
              : "N/A"}
          </div>
          <span className="cricket-card-status-title">
            {matchInfo?.status ? matchInfo?.status : "N/A"}
          </span>
        </div>
        {liveScores && (
          <>
            <div className="cricket-card-scorecard-wrapper">
              <div className="cricket-card-score">
                <div className="cricket-card-score-teamName">
                  {matchInfo[liveScores?.teamId]}
                </div>
                <div className="cricket-card-score-runs">
                  {liveScores?.runs}
                </div>
                <div> / </div>
                <div className="cricket-card-score-wickets">
                  {liveScores?.wickets}
                </div>
                <div className="cricket-card-score-overs">
                  {" "}
                  ( {liveScores?.overs} )
                </div>
              </div>
              <div className="cricket-card-run-rate-wrapper">
                <div>
                  CRR :<span className="crr">{liveScores.currentRunRate}</span>
                </div>
                {liveScores?.requiredRunRate > 0 && (
                  <div>
                    RRR :
                    <span className="rrr">{liveScores.requiredRunRate}</span>
                  </div>
                )}
              </div>
            </div>
            <span>Partnership :</span>{" "}
            <span className="runs">{liveScores?.partnerShip?.runs}</span>
            <span className="balls">({liveScores?.partnerShip?.balls}) </span>
            <div className="cricket-card-batsman-wrapper">
              <table>
                <thead
                  style={{
                    background: "#ecebeb",
                  }}
                >
                  <tr>
                    <th>Batter</th>
                    <th>R</th>
                    <th>B</th>
                    <th>4's</th>
                    <th>6's</th>
                    <th>SR</th>
                    <th>Dots</th>
                    <th>Mins</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="striker-name">
                        {liveScores?.strikerData?.batName}
                      </span>
                    </td>
                    <td>{liveScores?.strikerData?.batRuns}</td>
                    <td>{liveScores?.strikerData?.batBalls}</td>
                    <td>{liveScores?.strikerData?.batFours}</td>
                    <td>{liveScores?.strikerData?.batSixes}</td>
                    <td>{liveScores?.strikerData?.batStrikeRate}</td>
                    <td>{liveScores?.strikerData?.batDots}</td>
                    <td>{liveScores?.strikerData?.batMins}</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="non-striker-name">
                        {liveScores?.nonStrikerData?.batName}
                      </span>
                    </td>
                    <td>{liveScores?.nonStrikerData?.batRuns}</td>
                    <td>{liveScores?.nonStrikerData?.batBalls}</td>
                    <td>{liveScores?.nonStrikerData?.batFours}</td>
                    <td>{liveScores?.nonStrikerData?.batSixes}</td>
                    <td>{liveScores?.nonStrikerData?.batStrikeRate}</td>
                    <td>{liveScores?.nonStrikerData?.batDots}</td>
                    <td>{liveScores?.nonStrikerData?.batMins}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="cricket-card-bowler-wrapper">
              <table>
                <thead
                  style={{
                    background: "#ecebeb",
                  }}
                >
                  <tr>
                    <th>Bowler</th>
                    <th>Ov</th>
                    <th>RN</th>
                    <th>WK</th>
                    <th>EC</th>
                    <th>M</th>
                    <th>WD</th>
                    <th>NB</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="striker-name">
                        {liveScores?.bowlerStriker?.bowlName}
                      </span>
                    </td>
                    <td>{liveScores?.bowlerStriker?.bowlOvs}</td>
                    <td>{liveScores?.bowlerStriker?.bowlRuns}</td>
                    <td>{liveScores?.bowlerStriker?.bowlWkts}</td>
                    <td>{liveScores?.bowlerStriker?.bowlEcon}</td>
                    <td>{liveScores?.bowlerStriker?.bowlMaidens}</td>
                    <td>{liveScores?.bowlerStriker?.bowlWides}</td>
                    <td>{liveScores?.bowlerStriker?.bowlNoballs}</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="non-striker-name">
                        {liveScores?.bowlerNonStriker?.bowlName}
                      </span>
                    </td>
                    <td>{liveScores?.bowlerNonStriker?.bowlOvs}</td>
                    <td>{liveScores?.bowlerNonStriker?.bowlRuns}</td>
                    <td>{liveScores?.bowlerNonStriker?.bowlWkts}</td>
                    <td>{liveScores?.bowlerNonStriker?.bowlEcon}</td>
                    <td>{liveScores?.bowlerNonStriker?.bowlMaidens}</td>
                    <td>{liveScores?.bowlerNonStriker?.bowlWides}</td>
                    <td>{liveScores?.bowlerNonStriker?.bowlNoballs}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="last-wicket">{liveScores?.lastWicket}</p>
          </>
        )}
      </div>
      <button
        className="deleteBtn"
        onClick={() => {
          removeFromFollowList();
          clearInterval(intervalId);
        }}
      >
        Unfollow
      </button>
    </div>
  );
};
const ScoreComponent = ({ matchId, removeFromFollowList }) => {
  const [matchInfo, setMatchInfo] = useState(null);
  const [liveScores, setLiveScores] = useState(null);
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [isMatchComplete, setIsMatchComplete] = useState(false);
  useEffect(() => {
    async function fetchMatchInfo() {
      try {
        let request = await axios.get(`${API_URL}${matchId}`);
        let result = request.data;
        let tmpMatchInfo = {
          matchFormat: result?.matchHeader?.matchFormat,
          seriesName: result?.matchHeader?.seriesName,
          state: result?.matchHeader?.state,
          status: result?.matchHeader?.status,
          matchBetween: `${result?.matchHeader?.team1?.shortName} vs ${result?.matchHeader?.team2?.shortName}`,
          tossWinner: result?.matchHeader?.tossResults?.tossWinnerName,
          tossDecision: result?.matchHeader?.tossResults?.decision,
          team1Id: result?.matchHeader?.team1?.id,
          team1Name: result?.matchHeader?.team1?.shortName,
          team2Id: result?.matchHeader?.team2?.id,
          team2Name: result?.matchHeader?.team2?.shortName,
          [`${result?.matchHeader?.team1?.id}`]:
            result?.matchHeader?.team1?.shortName,
          [`${result?.matchHeader?.team2?.id}`]:
            result?.matchHeader?.team2?.shortName,
        };
        setMatchInfo(tmpMatchInfo);
        setInfoLoaded(true);
        setIsMatchComplete(result?.matchHeader?.complete);
      } catch (error) {
        setMatchInfo({});
        setInfoLoaded(false);
      }
    }
    if (matchId) {
      fetchMatchInfo();
    }
  }, [matchId]);

  async function fetchLiveScores() {
    console.log("fetching live scores");
    let request = await axios.get(`${API_URL}${matchId}`);
    let result = request.data;
    let tmpLiveScores = {
      teamId: result?.miniscore?.batTeam?.teamId,
      runs: result?.miniscore?.batTeam?.teamScore,
      wickets: result?.miniscore?.batTeam?.teamWkts,
      overs: result?.miniscore?.overs,
      currentRunRate: result?.miniscore?.currentRunRate,
      requiredRunRate: result?.miniscore?.requiredRunRate,
      lastWicket: result?.miniscore?.lastWicket,
      partnerShip: result?.miniscore?.partnerShip,
      strikerData: {
        batName: result?.miniscore?.batsmanStriker?.batName,
        batRuns: result?.miniscore?.batsmanStriker?.batRuns,
        batBalls: result?.miniscore?.batsmanStriker?.batBalls,
        batDots: result?.miniscore?.batsmanStriker?.batDots,
        batFours: result?.miniscore?.batsmanStriker?.batFours,
        batSixes: result?.miniscore?.batsmanStriker?.batSixes,
        batStrikeRate: result?.miniscore?.batsmanStriker?.batStrikeRate,
        batMins: result?.miniscore?.batsmanStriker?.batMins,
      },
      nonStrikerData: {
        batName: result?.miniscore?.batsmanNonStriker?.batName,
        batRuns: result?.miniscore?.batsmanNonStriker?.batRuns,
        batBalls: result?.miniscore?.batsmanNonStriker?.batBalls,
        batDots: result?.miniscore?.batsmanNonStriker?.batDots,
        batFours: result?.miniscore?.batsmanNonStriker?.batFours,
        batSixes: result?.miniscore?.batsmanNonStriker?.batSixes,
        batStrikeRate: result?.miniscore?.batsmanNonStriker?.batStrikeRate,
        batMins: result?.miniscore?.batsmanNonStriker?.batMins,
      },
      bowlerStriker: {
        bowlName: result?.miniscore?.bowlerStriker?.bowlName,
        bowlOvs: result?.miniscore?.bowlerStriker?.bowlOvs,
        bowlRuns: result?.miniscore?.bowlerStriker?.bowlRuns,
        bowlWkts: result?.miniscore?.bowlerStriker?.bowlWkts,
        bowlEcon: result?.miniscore?.bowlerStriker?.bowlEcon,
        bowlMaidens: result?.miniscore?.bowlerStriker?.bowlMaidens,
        bowlWides: result?.miniscore?.bowlerStriker?.bowlWides,
        bowlNoballs: result?.miniscore?.bowlerStriker?.bowlNoballs,
      },
      bowlerNonStriker: {
        bowlName: result?.miniscore?.bowlerNonStriker?.bowlName,
        bowlOvs: result?.miniscore?.bowlerNonStriker?.bowlOvs,
        bowlRuns: result?.miniscore?.bowlerNonStriker?.bowlRuns,
        bowlWkts: result?.miniscore?.bowlerNonStriker?.bowlWkts,
        bowlEcon: result?.miniscore?.bowlerNonStriker?.bowlEcon,
        bowlMaidens: result?.miniscore?.bowlerNonStriker?.bowlMaidens,
        bowlWides: result?.miniscore?.bowlerNonStriker?.bowlWides,
        bowlNoballs: result?.miniscore?.bowlerNonStriker?.bowlNoballs,
      },
    };

    setIsMatchComplete(result?.matchHeader?.complete);

    setLiveScores(tmpLiveScores);
    if (result?.matchHeader?.complete) {
      return clearInterval(intervalId);
    }
    return;
  }

  const [intervalId] = useInterval(fetchLiveScores, infoLoaded ? 2000 : null);
  return (
    <DefaultCricketLiveScoreComponent
      matchInfo={matchInfo}
      liveScores={liveScores}
      removeFromFollowList={removeFromFollowList}
      intervalId={intervalId}
    />
  );
};
function App() {
  const [matchIds, setMatchIds] = useState([]);
  const [tempMatchId, setTempMatchId] = useState("");
  useEffect(() => {
    const matches = localStorage.getItem("matches");
    if (matches) setMatchIds(JSON.parse(matches));
  }, []);

  function addMatchtoFollowList(matchId) {
    const newMatchIds = Array.from(new Set([...matchIds, matchId]));
    setMatchIds(newMatchIds);
    localStorage.setItem("matches", JSON.stringify(newMatchIds));
  }

  function removeFromFollowList(index) {
    const newMatchIds = matchIds.filter((_, i) => i !== index);
    setMatchIds(newMatchIds);
    localStorage.setItem("matches", JSON.stringify(newMatchIds));
  }
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {matchIds.map((matchId, index) => {
          return (
            <ScoreComponent
              matchId={matchId}
              removeFromFollowList={() => removeFromFollowList(index)}
              key={matchId}
            />
          );
        })}
      </div>
      <hr />
      <input
        type="number"
        value={tempMatchId}
        onChange={(e) => setTempMatchId(e.target.value)}
      />
      <button
        onClick={() => {
          addMatchtoFollowList(tempMatchId);
          setTempMatchId("");
        }}
      >
        Follow New Match
      </button>
    </>
  );
}

export default App;
