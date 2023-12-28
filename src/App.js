import axios from "axios";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import "./App.css";
import { ReactComponent as ExpandLess } from "./expand_less.svg";
import { ReactComponent as ExpandMore } from "./expand_more.svg";
import teamsData from "./teams.json";

const API_URL = "https://www.cricbuzz.com/api/cricket-match/commentary/";

const MATCH_STATES = {
  Preview: 2,
  "Innings Break": 2,
  Complete: -1,
  Stumps: 2,
  "In Progress": 2,
  Rain: 2,
};

const EVENTS = {
  NONE: "",
  "over-break": "Over Completed ",
  SIX: "It's a SIX!! ",
  FOUR: "It's a FOUR!",
  MAIDEN_OVER: "It's a MAIDEN OVER!! ",
  HIGHSCORING_OVER: "It's a HIGHSCORING OVER!! ",
  TEAM_FIFTY: "Team FIFTY ",
  PARTNERSHIP: "",
  WICKET: "Its a WICKET!! ",
};

function shouldMatchDataHidden(matchState) {
  if (matchState === "Preview") {
    return true;
  }
  return false;
}
function shouldLiveDataHidden(matchState) {
  if (matchState === "Preview" || matchState === "Complete") {
    return true;
  }
  return false;
}

const calculatePercentage = (value, total) => {
  if (value === 0 || total === 0) {
    return "0%";
  }
  return ((value / total) * 100).toFixed(2) + "%";
};

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
};

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
      {flag1 !== "" && <img src={flag1} className="flag-style" alt={team1} />}
      <span className="title-spacing">{team1}</span>
      <span>vs</span>
      {flag2 !== "" && <img src={flag2} className="flag-style" alt={team2} />}
      <span className="title-spacing">{team2}</span>
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

const MatchStatus = ({ status }) => {
  return <div className="cricket-card-status-title">{status}</div>;
};

const PlayerOfTheMatchCard = ({ playersOfTheMatch, isMatchComplete }) => {
  if (!isMatchComplete || !playersOfTheMatch) return null;
  const { fullName } = playersOfTheMatch[0];
  return (
    <div>
      <span>Player of the Match :</span>
      <span className="player-of-the-match">{fullName}</span>
    </div>
  );
};
const CrikcetCardToss = ({ tossWinner, tossDecision,hidden }) => {
  if (hidden) return null;
  return (
    <div className="cricket-card-toss">
      <span className="cricket-card-toss-title">Toss:</span>
      {tossWinner ? tossWinner + "(" + tossDecision + ")" : "N/A"}
    </div>
  );
};

const CricketScoreCard = ({ crr, rrr, matchScoreDetails, hidden }) => {
  if (hidden) return null;
  return (
    <div className="cricket-card-scorecard-wrapper">
      {matchScoreDetails?.inningsScoreList?.map((inning, index) => (
        <div className="cricket-scores-wrapper" key={index}>
          <div className="cricket-card-score" key={index}>
            <div className="cricket-card-score-teamName">
              {inning.batTeamName}
            </div>
            <div className="cricket-card-score-runs">
              {inning.score} / <span className="red">{inning.wickets}</span>
            </div>
            <div className="cricket-card-score-overs">({inning.overs})</div>
            {inning.isDeclared && <p>Declared</p>}
            {inning.isFollowOn && <p>Follow On</p>}
          </div>
          <div className="cricket-card-run-rate-wrapper">
            {index === 0 && (
              <>
                CRR :<span className="crr">{crr}</span>
                {rrr > 0 && (
                  <>
                    RRR :<span className="rrr">{rrr}</span>
                  </>
                )}
              </>
            )}
            {index !== 0 && (
              <>
                RR:{" "}
                <span className="crr">
                  {(inning.score / inning.overs).toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const PartnershipCard = ({ runs, balls, oversRemaining,hidden }) => {
  if (hidden) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>
        Partnership: <span className="runs">{runs}</span>
        <span className="balls">({balls})</span>
      </span>
      {oversRemaining ? (
        <span>
          Overs Rem: <span className="runs">{oversRemaining}</span>
        </span>
      ) : null}
    </div>
  );
};

const BattingCard = ({ strikerData, nonStrikerData, runs, hidden }) => {
  const [showOtherStats, setShowOtherStats] = useState(false);

  const renderCard = (data) => {
    const {
      batName,
      batRuns,
      batBalls,
      batStrikeRate,
      batFours,
      batSixes,
      batDots,
      batMins,
    } = data;

    const dotPercentage = calculatePercentage(batDots, batBalls);
    const fourPercentage = calculatePercentage(batFours * 4, batRuns);
    const sixPercentage = calculatePercentage(batSixes * 6, batRuns);
    const boundaryPercentage = calculatePercentage(
      batFours * 4 + batSixes * 6,
      batRuns
    );
    const timeInHours = batMins > 60 ? formatTime(batMins) : batMins + "m";
    const runPercentage = calculatePercentage(batRuns, runs);
    if (batName) {
      return (
        <div className="batting-card">
          <div className="player-info">
            <div className="player-name">{batName}</div>
            <div className="runs-balls">
              Runs: {batRuns} ({batBalls})
            </div>
            <div className="run-percentage">{runPercentage} Scored</div>
            <div className="strike-rate">Strike Rate: {batStrikeRate}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="strike-rate">
                Fours: <span className="count">{batFours}</span>
              </div>
              <div className="strike-rate">
                Sixes: <span className="count">{batSixes}</span>
              </div>
              <div className="strike-rate">
                Dots: <span className="count">{batDots}</span>
              </div>
            </div>
          </div>
          <div
            className="more-stats"
            onClick={() => setShowOtherStats(!showOtherStats)}
          >
            More Stats {showOtherStats ? <ExpandLess /> : <ExpandMore />}
          </div>
          {showOtherStats && (
            <div className="mins">
              Fours: <span className="count">{fourPercentage}</span>
              <br />
              Sixes: <span className="count">{sixPercentage}</span>
              <br />
              Dots: <span className="count">{dotPercentage}</span>
              <br />
              Boundaries: <span className="count">{boundaryPercentage}</span>
              <br />
              Time Spent: <span className="count">{timeInHours}</span>
            </div>
          )}
        </div>
      );
    }
  };
  if (hidden) return null;
  return (
    <div className="batting-cards-container">
      {renderCard(strikerData)}
      {renderCard(nonStrikerData)}
    </div>
  );
};

const SmallBattingCard = ({ strikerData, nonStrikerData, hidden }) => {
  if(hidden) return null;
  return (
    <>
      <b>
        {strikerData?.batName} - {strikerData?.batRuns}({strikerData?.batBalls})
      </b>
      <br />
      {nonStrikerData?.batName} - {nonStrikerData?.batRuns}(
      {nonStrikerData?.batBalls})
    </>
  );
};

const BowlingCard = ({ bowlerStriker, bowlerNonStriker, wickets, runs, hidden }) => {
  const renderCard = (data) => {
    const {
      bowlName,
      bowlWkts,
      bowlRuns,
      bowlOvs,
      bowlEcon,
      bowlMaidens,
      bowlWides,
      bowlNoballs,
    } = data;
    const wicketPercentage = calculatePercentage(bowlWkts, wickets);
    const runPercentage = calculatePercentage(bowlRuns, runs);
    return (
      <div className="batting-card">
        <div className="player-info">
          <div className="player-name">{bowlName}</div>
          <div className="runs-balls">Wickets: {bowlWkts}</div>
          <div className="run-percentage">{wicketPercentage} Taken</div>
          <div className="runs-balls">Runs Conceded: {bowlRuns}</div>
          <div className="run-percentage">{runPercentage} Conceded</div>
          <div className="strike-rate">Overs: {bowlOvs}</div>
          <div className="strike-rate">Economy: {bowlEcon}</div>
          <div className="strike-rate">Maidens: {bowlMaidens}</div>
          <div className="strike-rate">Wides: {bowlWides}</div>
          <div className="strike-rate">No Balls: {bowlNoballs}</div>
        </div>
      </div>
    );
  };
  if (hidden) return null;
  return (
    <div className="batting-cards-container">
      {renderCard(bowlerStriker)}
      {renderCard(bowlerNonStriker)}
    </div>
  );
};

const SmallBowlingCard = ({ bowlerStriker, bowlerNonStriker, hidden }) => {
  if (hidden) return null;
  return (
    <>
      <b>
        {bowlerStriker?.bowlName} - {bowlerStriker?.bowlRuns} -{" "}
        {bowlerStriker?.bowlWkts}
      </b>
      <br />
      {bowlerNonStriker?.bowlName} - {bowlerNonStriker?.bowlRuns} -{" "}
      {bowlerNonStriker?.bowlWkts}
    </>
  );
};

const TitleClickonExpand = ({ onClick, title, boolCheck, hidden }) => {
  if (hidden) return null;
  return (
    <div className="title-container" onClick={onClick}>
      <span
        style={{
          color: "#fff",
          fontWeight: 600,
          marginLeft: 5,
        }}
      >
        {title}
      </span>
      {boolCheck ? <ExpandLess /> : <ExpandMore />}
    </div>
  );
} ;
const UDRSCard = ({ matchUdrs,flag1,flag2,team1Name,team2Name, hidden}) => {
  const [showUdrsDetails, setShowUdrsDetails] = useState(false);
  if (hidden || !matchUdrs) return null;
  return (
    <>
      <TitleClickonExpand
        onClick={() => setShowUdrsDetails(!showUdrsDetails)}
        title="UDRS"
        boolCheck={showUdrsDetails}
      />
      {showUdrsDetails && (
        <table>
          <thead>
            <tr key="1">
              <th></th>
              <th>Team</th>
              <th>Rem</th>
              <th>Successful</th>
              <th>UnSuccessful</th>
            </tr>
          </thead>
          <tbody>
            <tr key="2">
              <td>
                <img
                  src={flag1}
                  className="flag-style"
                  alt={`Flag of ${team1Name}`}
                />
              </td>
              <td>{team1Name}</td>
              <td>{matchUdrs?.team1Remaining}</td>
              <td>{matchUdrs?.team1Successful}</td>
              <td>{matchUdrs?.team1Unsuccessful}</td>
            </tr>
            <tr key="3">
              <td>
                <img
                  src={flag2}
                  className="flag-style"
                  alt={`Flag of ${team2Name}`}
                />
              </td>
              <td>{team2Name}</td>
              <td>{matchUdrs?.team2Remaining}</td>
              <td>{matchUdrs?.team2Successful}</td>
              <td>{matchUdrs?.team2Unsuccessful}</td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
};

const LastCommentCard = ({ commentaryList, lastWicket, hidden }) => {
  const [showComm, setShowComm] = useState(false);
  if (hidden) return null;

  const { commText, event, overNumber } = commentaryList || '';

  const generateEventLabels = (events) => {
    return events.map((e, i) => EVENTS[e] || "").join(" ");
  };

  return (
    <>
      <TitleClickonExpand
        onClick={() => setShowComm(!showComm)}
        title="Latest Commentary"
        boolCheck={showComm}
      />
      {showComm && (
        <>
          <div className="over-wrapper">
            <div className="over-number">{overNumber}</div>
            <div className="event">
              {generateEventLabels(event?.split(","))}
            </div>
          </div>
          <div>{commText}</div>
          <>{lastWicket && <LastWicketDataCard lastWicket={lastWicket} />}</>
        </>
      )}
    </>
  );
};

const LastWicketDataCard = ({ lastWicket }) => {
  return (
    <div className="m-t10 m-b5">
      <span>Last Wicket :</span>
      <span className="last-wicket">{lastWicket}</span>
    </div>
  );
};


const ScoreComponent = ({ matchId, removeFromFollowList }) => {
  const [isMatchComplete, setIsMatchComplete] = useState(true);
  const [matchData, setMatchData] = useState({});
  const [matchState, setMatchState] = useState("Preview");
  const [showBatingDetails, setShowBatingDetails] = useState(false);
  const [showBowlingDetails, setShowBowlingDetails] = useState(false);

  const fetchLiveScores = useCallback(async () => {
    const { data } = await axios.get(`${API_URL}${matchId}`);
    const { matchHeader, miniscore, commentaryList } = data;
    let tmpMatchInfo = {
      complete: matchHeader?.complete,
      dayNight: matchHeader?.dayNight,
      dayNumber: matchHeader?.dayNumber,
      domestic: matchHeader?.domestic,
      matchDescription: matchHeader?.matchDescription,
      matchFormat: matchHeader?.matchFormat,
      matchCompleteTimestamp: matchHeader?.matchCompleteTimestamp,
      matchStartTimestamp: matchHeader?.matchStartTimestamp,
      matchType: matchHeader?.matchType,
      playersOfTheMatch: matchHeader?.playersOfTheMatch,
      playersOfTheSeries: matchHeader?.playersOfTheSeries,
      results: matchHeader?.results,
      revisedTarget: matchHeader?.revisedTarget,
      seriesName: matchHeader?.seriesName,
      state: matchHeader?.state,
      status: matchHeader?.status,
      tossWinner: matchHeader?.tossResults?.tossWinnerName,
      tossDecision: matchHeader?.tossResults?.decision,
      team1Id: matchHeader?.team1?.id,
      team1Name: matchHeader?.team1?.shortName,
      team2Id: matchHeader?.team2?.id,
      team2Name: matchHeader?.team2?.shortName,
      [`${matchHeader?.team1?.id}`]: matchHeader?.team1?.shortName,
      [`${matchHeader?.team2?.id}`]: matchHeader?.team2?.shortName,
      batTeamId: miniscore?.batTeam?.teamId,
      runs: miniscore?.batTeam?.teamScore,
      wickets: miniscore?.batTeam?.teamWkts,
      currentRunRate: miniscore?.currentRunRate,
      event: miniscore?.event,
      inningsId: miniscore?.inningsId,
      overs: miniscore?.overs,
      oversRem: miniscore?.oversRem,
      recentOvsStats: miniscore?.recentOvsStats,
      remRunsToWin: miniscore?.remRunsToWin,
      requiredRunRate: miniscore?.requiredRunRate,
      lastWicket: miniscore?.lastWicket,
      partnerShip: miniscore?.partnerShip,
      strikerData: {
        batName: miniscore?.batsmanStriker?.batName,
        batRuns: miniscore?.batsmanStriker?.batRuns,
        batBalls: miniscore?.batsmanStriker?.batBalls,
        batDots: miniscore?.batsmanStriker?.batDots,
        batFours: miniscore?.batsmanStriker?.batFours,
        batSixes: miniscore?.batsmanStriker?.batSixes,
        batStrikeRate: miniscore?.batsmanStriker?.batStrikeRate,
        batMins: miniscore?.batsmanStriker?.batMins,
        batId: miniscore?.batsmanStriker?.batId,
      },
      nonStrikerData: {
        batName: miniscore?.batsmanNonStriker?.batName,
        batRuns: miniscore?.batsmanNonStriker?.batRuns,
        batBalls: miniscore?.batsmanNonStriker?.batBalls,
        batDots: miniscore?.batsmanNonStriker?.batDots,
        batFours: miniscore?.batsmanNonStriker?.batFours,
        batSixes: miniscore?.batsmanNonStriker?.batSixes,
        batStrikeRate: miniscore?.batsmanNonStriker?.batStrikeRate,
        batMins: miniscore?.batsmanNonStriker?.batMins,
        batId: miniscore?.batsmanNonStriker?.batId,
      },
      bowlerStriker: {
        bowlName: miniscore?.bowlerStriker?.bowlName,
        bowlOvs: miniscore?.bowlerStriker?.bowlOvs,
        bowlRuns: miniscore?.bowlerStriker?.bowlRuns,
        bowlWkts: miniscore?.bowlerStriker?.bowlWkts,
        bowlEcon: miniscore?.bowlerStriker?.bowlEcon,
        bowlMaidens: miniscore?.bowlerStriker?.bowlMaidens,
        bowlWides: miniscore?.bowlerStriker?.bowlWides,
        bowlNoballs: miniscore?.bowlerStriker?.bowlNoballs,
        bowlId: miniscore?.bowlerStriker?.bowlId,
      },
      bowlerNonStriker: {
        bowlName: miniscore?.bowlerNonStriker?.bowlName,
        bowlOvs: miniscore?.bowlerNonStriker?.bowlOvs,
        bowlRuns: miniscore?.bowlerNonStriker?.bowlRuns,
        bowlWkts: miniscore?.bowlerNonStriker?.bowlWkts,
        bowlEcon: miniscore?.bowlerNonStriker?.bowlEcon,
        bowlMaidens: miniscore?.bowlerNonStriker?.bowlMaidens,
        bowlWides: miniscore?.bowlerNonStriker?.bowlWides,
        bowlNoballs: miniscore?.bowlerNonStriker?.bowlNoballs,
        bowlId: miniscore?.bowlerNonStriker?.bowlId,
      },
      latestPerformance: miniscore?.latestPerformance,
      matchScoreDetails: miniscore?.matchScoreDetails,
      matchUdrs: miniscore?.matchUdrs,
      commentaryList: commentaryList[0],
    };
    setMatchData(tmpMatchInfo);
    setMatchState(matchHeader?.state);
    return;
  }, [matchId]);

  useEffect(() => {
    if (matchId) {
      fetchLiveScores();
    }
  }, [matchId, fetchLiveScores]);


  useEffect(() => {
    if (MATCH_STATES[matchState]) {
      setIsMatchComplete(MATCH_STATES[matchState] !== -1 ? false : true);
    } else {
      setIsMatchComplete(false);
    }
  }, [matchState]);

  const [intervalId] = useInterval(
    fetchLiveScores,
    !isMatchComplete ? 4000 : null
  );

  useEffect(() => {
    if (isMatchComplete) {
      return clearInterval(intervalId);
    }
  }, [isMatchComplete, intervalId]);

  const {
    team1Name,
    team2Name,
    matchFormat,
    seriesName,
    status,
    tossWinner,
    tossDecision,
    currentRunRate,
    requiredRunRate,
    matchScoreDetails,
    partnerShip,
    oversRem,
    strikerData,
    nonStrikerData,
    runs,
    bowlerStriker,
    bowlerNonStriker,
    wickets,
    commentaryList,
    lastWicket,
    matchUdrs,
    playersOfTheMatch,
  } = matchData;
  const flag1 = teamsData[matchData?.team1Id]?.flag;
  const flag2 = teamsData[matchData?.team2Id]?.flag;

  return (
    <div className="score-container">
      <div className="cricket-card">
        <div className="cricket-card-title-wrapper">
          <CricketCardTitle
            flag1={flag1}
            team1={team1Name}
            flag2={flag2}
            team2={team2Name}
          />
          <CricketMatchFormat matchFormat={matchFormat} />
        </div>
        <CricketCardSubtitle subtitle={seriesName} />
        <MatchStatus status={status} />
        <PlayerOfTheMatchCard
          playersOfTheMatch={playersOfTheMatch}
          isMatchComplete={isMatchComplete}
        />
        <CrikcetCardToss
          tossWinner={tossWinner}
          tossDecision={tossDecision}
          hidden={shouldMatchDataHidden(matchState)}
        />
        <CricketScoreCard
          crr={currentRunRate}
          rrr={requiredRunRate}
          matchScoreDetails={matchScoreDetails}
          hidden={shouldMatchDataHidden(matchState)}
        />
        <PartnershipCard
          runs={partnerShip?.runs}
          balls={partnerShip?.balls}
          oversRemaining={oversRem}
          hidden={shouldLiveDataHidden(matchState)}
        />
        <TitleClickonExpand
          onClick={() => setShowBatingDetails(!showBatingDetails)}
          title="Batting"
          boolCheck={showBatingDetails}
          hidden={shouldLiveDataHidden(matchState)}
        />
        <BattingCard
          strikerData={strikerData}
          nonStrikerData={nonStrikerData}
          matchFormat={matchFormat}
          runs={runs}
          hidden={!showBatingDetails || shouldLiveDataHidden(matchState)}
        />
        <SmallBattingCard
          strikerData={strikerData}
          nonStrikerData={nonStrikerData}
          hidden={showBatingDetails || shouldLiveDataHidden(matchState)}
        />
        <TitleClickonExpand
          onClick={() => setShowBowlingDetails(!showBowlingDetails)}
          title="Bowling Stats"
          boolCheck={showBowlingDetails}
          hidden={shouldLiveDataHidden(matchState)}
        />
        <BowlingCard
          bowlerStriker={bowlerStriker}
          bowlerNonStriker={bowlerNonStriker}
          matchFormat={matchFormat}
          runs={runs}
          wickets={wickets}
          hidden={!showBowlingDetails || shouldLiveDataHidden(matchState)}
        />
        <SmallBowlingCard
          bowlerStriker={bowlerStriker}
          bowlerNonStriker={bowlerNonStriker}
          hidden={showBowlingDetails || shouldLiveDataHidden(matchState)}
        />
        <UDRSCard
          matchUdrs={matchUdrs}
          flag1={flag1}
          flag2={flag2}
          team1Name={team1Name}
          team2Name={team2Name}
          hidden={shouldLiveDataHidden(matchState)}
        />
        <LastCommentCard
          commentaryList={commentaryList}
          lastWicket={lastWicket}
          hidden={shouldLiveDataHidden(matchState)}
        />

        <div className="deleteBtnWrapper">
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
      </div>
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
    if (!Number.isNaN(Number(matchId))) {
      const newMatchIds = Array.from(new Set([...matchIds, matchId]));
      setMatchIds(newMatchIds);
      localStorage.setItem("matches", JSON.stringify(newMatchIds));
      setTempMatchId("");
      return;
    } else {
      setTempMatchId("");
      return;
    }
  }

  function removeFromFollowList(index) {
    const newMatchIds = matchIds.filter((_, i) => i !== index);
    setMatchIds(newMatchIds);
    localStorage.setItem("matches", JSON.stringify(newMatchIds));
    return;
  }

  return (
    <>
      <div className="flex-container">
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
        className="followNewBtn"
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
