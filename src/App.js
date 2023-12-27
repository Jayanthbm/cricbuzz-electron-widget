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


const CricketCardTitle = ({ flag1, team1, flag2, team2 }) => {
  return (
    <div className="cricket-card-title">
      {flag1 !== "" && <img src={flag1} width={25} height={18} alt="Flag" />}
      <span>{team1}</span>
      <span>vs</span>
      {flag2 !== "" && <img src={flag2} width={25} height={18} alt="Flag" />}
      <span>{team2}</span>
    </div>
  );
};

const CricketMatchFormat = ({ matchFormat }) => {
  return (
    <div className={`cricket-card-format ${matchFormat}`}>{matchFormat}</div>
  );
};

const CricketCardSubtitle = ({ subtitle }) => {
  return <div className="cricket-card-subtitle">{subtitle}</div>;
};

const CrikcetCardToss = ({ tossWinner, tossDecision }) => {
  return (
    <div className="cricket-card-toss">
      <span className="cricket-card-toss-title">Toss:</span>
      {tossWinner ? tossWinner + "(" + tossDecision + ")" : "N/A"}
    </div>
  );
};

const MatchStatus = ({ status }) => {
  return <div className="cricket-card-status-title">{status}</div>;
}

const CricketScoreCard = ({
  batTeamName,
  runs,
  wickets,
  overs,
  crr,
  rrr,
}) => {
  if (batTeamName && runs && wickets) {
    return (
      <div className="cricket-card-scorecard-wrapper">
        <div className="cricket-card-score">
          <div className="cricket-card-score-teamName">{batTeamName}</div>
          <div className="cricket-card-score-runs">{runs}</div>
          <div> / </div>
          <div className="cricket-card-score-wickets">{wickets}</div>
          <div className="cricket-card-score-overs">({overs})</div>
        </div>
        <div className="cricket-card-run-rate-wrapper">
          <>
            CRR :<span className="crr">{crr}</span>
          </>
          {rrr > 0 && (
            <>
              RRR :<span className="rrr">{rrr}</span>
            </>
          )}
        </div>
      </div>
    );
  }
  return <></>;
};

const PartnershipCard = ({ runs, balls }) => {
  return (
    <div>
      <span>Partnership :</span> <span className="runs">{runs}</span>
      <span className="balls">({balls}) </span>
    </div>
  );
}

const LastWicketDataCard = ({ lastWicket }) => {
  return <p className="last-wicket">{lastWicket}</p>;
}
const ScoreComponent = ({ matchId, removeFromFollowList }) => {
  const [isMatchComplete, setIsMatchComplete] = useState(true);
  const [matchData, setMatchData] = useState({});
  useEffect(() => {
    async function fetchMatchInfo() {
      try {
        let request = await axios.get(`${API_URL}${matchId}`);
        let result = request.data;
        let tmpMatchInfo = {
          complete: result?.matchHeader?.complete,
          dayNight: result?.matchHeader?.dayNight,
          dayNumber: result?.matchHeader?.dayNumber,
          domestic: result?.matchHeader?.domestic,
          matchDescription: result?.matchHeader?.matchDescription,
          matchFormat: result?.matchHeader?.matchFormat,
          matchCompleteTimestamp: result?.matchHeader?.matchCompleteTimestamp,
          matchStartTimestamp: result?.matchHeader?.matchStartTimestamp,
          matchType: result?.matchHeader?.matchType,
          playersOfTheMatch: result?.matchHeader?.playersOfTheMatch,
          playersOfTheSeries: result?.matchHeader?.playersOfTheSeries,
          results: result?.matchHeader?.results,
          revisedTarget: result?.matchHeader?.revisedTarget,
          seriesName: result?.matchHeader?.seriesName,
          state: result?.matchHeader?.state,
          status: result?.matchHeader?.status,
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
          batTeamId: result?.miniscore?.batTeam?.teamId,
          runs: result?.miniscore?.batTeam?.teamScore,
          wickets: result?.miniscore?.batTeam?.teamWkts,
          currentRunRate: result?.miniscore?.currentRunRate,
          event: result?.miniscore?.event,
          inningsId: result?.miniscore?.inningsId,
          overs: result?.miniscore?.overs,
          oversRem: result?.miniscore?.oversRem,
          recentOvsStats: result?.miniscore?.recentOvsStats,
          remRunsToWin: result?.miniscore?.remRunsToWin,
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
          latestPerformance: result?.miniscore?.latestPerformance,
          matchScoreDetails: result?.miniscore?.matchScoreDetails,
          matchUdrs: result?.miniscore?.matchUdrs,
        };
        setMatchData(tmpMatchInfo);
        setIsMatchComplete(result?.matchHeader?.complete);
      } catch (error) {
        console.log(error);
        setMatchData(null);
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
      complete: result?.matchHeader?.complete,
      dayNight: result?.matchHeader?.dayNight,
      dayNumber: result?.matchHeader?.dayNumber,
      domestic: result?.matchHeader?.domestic,
      matchDescription: result?.matchHeader?.matchDescription,
      matchFormat: result?.matchHeader?.matchFormat,
      matchCompleteTimestamp: result?.matchHeader?.matchCompleteTimestamp,
      matchStartTimestamp: result?.matchHeader?.matchStartTimestamp,
      matchType: result?.matchHeader?.matchType,
      playersOfTheMatch: result?.matchHeader?.playersOfTheMatch,
      playersOfTheSeries: result?.matchHeader?.playersOfTheSeries,
      results: result?.matchHeader?.results,
      revisedTarget: result?.matchHeader?.revisedTarget,
      seriesName: result?.matchHeader?.seriesName,
      state: result?.matchHeader?.state,
      status: result?.matchHeader?.status,
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
      batTeamId: result?.miniscore?.batTeam?.teamId,
      runs: result?.miniscore?.batTeam?.teamScore,
      wickets: result?.miniscore?.batTeam?.teamWkts,
      currentRunRate: result?.miniscore?.currentRunRate,
      event: result?.miniscore?.event,
      inningsId: result?.miniscore?.inningsId,
      overs: result?.miniscore?.overs,
      oversRem: result?.miniscore?.oversRem,
      recentOvsStats: result?.miniscore?.recentOvsStats,
      remRunsToWin: result?.miniscore?.remRunsToWin,
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
      latestPerformance: result?.miniscore?.latestPerformance,
      matchScoreDetails: result?.miniscore?.matchScoreDetails,
      matchUdrs: result?.miniscore?.matchUdrs,
    };

    setIsMatchComplete(result?.matchHeader?.complete);
    setMatchData(tmpLiveScores);
    if (result?.matchHeader?.complete) {
      return clearInterval(intervalId);
    }
    return;
  }

  const [intervalId] = useInterval(
    fetchLiveScores,
    !isMatchComplete ? 2000 : null
  );
  return (
    <div style={{ marginLeft: 15, marginRight: 15 }}>
      <div className="cricket-card">
        <div className="cricket-card-title-wrapper">
          <CricketCardTitle
            flag1={teamsData[matchData?.team1Id]?.flag}
            team1={matchData?.team1Name}
            flag2={teamsData[matchData?.team2Id]?.flag}
            team2={matchData?.team2Name}
          />
          <CricketMatchFormat matchFormat={matchData?.matchFormat} />
        </div>
        <CricketCardSubtitle subtitle={matchData?.seriesName} />
        <CrikcetCardToss
          tossWinner={matchData?.tossWinner}
          tossDecision={matchData?.tossDecision}
        />
        <MatchStatus status={matchData?.status} />
        <CricketScoreCard
          batTeamName={matchData[matchData?.batTeamId]}
          runs={matchData?.runs}
          wickets={matchData?.wickets}
          overs={matchData?.overs}
          crr={matchData.currentRunRate}
          rrr={matchData.requiredRunRate}
          isMatchComplete={isMatchComplete}
        />
        {!isMatchComplete && (
          <PartnershipCard
            runs={matchData?.partnerShip?.runs}
            balls={matchData?.partnerShip?.balls}
          />
        )}

        {matchData && (
          <>
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
                        {matchData?.strikerData?.batName}
                      </span>
                    </td>
                    <td>{matchData?.strikerData?.batRuns}</td>
                    <td>{matchData?.strikerData?.batBalls}</td>
                    <td>{matchData?.strikerData?.batFours}</td>
                    <td>{matchData?.strikerData?.batSixes}</td>
                    <td>{matchData?.strikerData?.batStrikeRate}</td>
                    <td>{matchData?.strikerData?.batDots}</td>
                    <td>{matchData?.strikerData?.batMins}</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="non-striker-name">
                        {matchData?.nonStrikerData?.batName}
                      </span>
                    </td>
                    <td>{matchData?.nonStrikerData?.batRuns}</td>
                    <td>{matchData?.nonStrikerData?.batBalls}</td>
                    <td>{matchData?.nonStrikerData?.batFours}</td>
                    <td>{matchData?.nonStrikerData?.batSixes}</td>
                    <td>{matchData?.nonStrikerData?.batStrikeRate}</td>
                    <td>{matchData?.nonStrikerData?.batDots}</td>
                    <td>{matchData?.nonStrikerData?.batMins}</td>
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
                        {matchData?.bowlerStriker?.bowlName}
                      </span>
                    </td>
                    <td>{matchData?.bowlerStriker?.bowlOvs}</td>
                    <td>{matchData?.bowlerStriker?.bowlRuns}</td>
                    <td>{matchData?.bowlerStriker?.bowlWkts}</td>
                    <td>{matchData?.bowlerStriker?.bowlEcon}</td>
                    <td>{matchData?.bowlerStriker?.bowlMaidens}</td>
                    <td>{matchData?.bowlerStriker?.bowlWides}</td>
                    <td>{matchData?.bowlerStriker?.bowlNoballs}</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="non-striker-name">
                        {matchData?.bowlerNonStriker?.bowlName}
                      </span>
                    </td>
                    <td>{matchData?.bowlerNonStriker?.bowlOvs}</td>
                    <td>{matchData?.bowlerNonStriker?.bowlRuns}</td>
                    <td>{matchData?.bowlerNonStriker?.bowlWkts}</td>
                    <td>{matchData?.bowlerNonStriker?.bowlEcon}</td>
                    <td>{matchData?.bowlerNonStriker?.bowlMaidens}</td>
                    <td>{matchData?.bowlerNonStriker?.bowlWides}</td>
                    <td>{matchData?.bowlerNonStriker?.bowlNoballs}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {!isMatchComplete && (
              <LastWicketDataCard lastWicket={matchData?.lastWicket} />
            )}
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
