import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { ReactComponent as ExpandLess } from "./expand_less.svg";
import { ReactComponent as ExpandMore } from "./expand_more.svg";
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
      <span
        style={{
          marginLeft: 3,
          marginRight: 3,
        }}
      >
        {team1}
      </span>
      <span
        style={{
          marginLeft: 3,
          marginRight: 10,
        }}
      >
        vs
      </span>
      {flag2 !== "" && <img src={flag2} width={25} height={18} alt="Flag" />}
      <span
        style={{
          marginLeft: 3,
          marginRight: 3,
        }}
      >
        {team2}
      </span>
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
};

const CricketScoreCard = ({ crr, rrr, matchScoreDetails }) => {
  return (
    <div>
      {matchScoreDetails?.inningsScoreList?.map((inning, index) => {
        return (
          <div className="cricket-card-scorecard-wrapper" key={index}>
            <div>
              <div className="cricket-card-score" key={index}>
                <div className="cricket-card-score-teamName">
                  {inning.batTeamName}
                </div>
                <div className="cricket-card-score-runs">{inning.score}</div>
                <div> / </div>
                <div className="cricket-card-score-wickets">
                  {inning.wickets}
                </div>
                <div className="cricket-card-score-overs">({inning.overs})</div>
                {inning.isDeclared === true && <p>Declared</p>}
                {inning.isFollowOn === true && <p>Follow On</p>}
              </div>
            </div>
            <div className="cricket-card-run-rate-wrapper">
              {index === 0 ? (
                <>
                  CRR :<span className="crr">{crr}</span>
                  {rrr > 0 && (
                    <>
                      RRR :<span className="rrr">{rrr}</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  RR:
                  <span className="crr">
                    {(inning.score / inning.overs).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PartnershipCard = ({ runs, balls }) => {
  return (
    <div>
      <span>Partnership :</span> <span className="runs">{runs}</span>
      <span className="balls">({balls}) </span>
    </div>
  );
};

const calculatePercentage = (value, total) => {
  if (value === 0 || total === 0) {
    return "0%";
  }
  return ((value / total) * 100).toFixed(2) + "%";
};
const BattingCard = ({ strikerData, nonStrikerData, runs }) => {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  const [showOtherStats, setShowOtherStats] = useState(false);
  const renderCard = (data) => {
    const dotPercentage = calculatePercentage(data.batDots, data.batBalls);
    const fourPercentage = calculatePercentage(data.batFours * 4, data.batRuns);
    const sixPercentage = calculatePercentage(data.batSixes * 6, data.batRuns);
    const boundaryPercentage = calculatePercentage(
      data.batFours * 4 + data.batSixes * 6,
      data.batRuns
    );
    const timeInHours =
      data.batMins > 60 ? formatTime(data.batMins) : data.batMins + "m";
    const runPercentage = calculatePercentage(data.batRuns, runs);

    return (
      <div className="batting-card">
        <div className="player-info">
          <div className="player-name">{data.batName}</div>
          <div className="runs-balls">
            Runs: {data.batRuns} ({data.batBalls})
          </div>
          <div className="run-percentage">{runPercentage} Scored</div>
          <div className="strike-rate">Strike Rate: {data.batStrikeRate}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="strike-rate">
              Fours: <span className="count">{data.batFours}</span>
            </div>
            <div className="strike-rate">
              Sixes: <span className="count">{data.batSixes}</span>
            </div>
            <div className="strike-rate">
              Dots: <span className="count">{data.batDots}</span>
            </div>
          </div>
        </div>
        <div
          className="more-stats"
          onClick={() => setShowOtherStats(!showOtherStats)}
        >
          More Stats
          {showOtherStats ? <ExpandLess /> : <ExpandMore />}
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
  };

  return (
    <div className="batting-cards-container">
      {renderCard(strikerData)}
      {renderCard(nonStrikerData)}
    </div>
  );
};

const BowlingCard = ({ bowlerStriker, bowlerNonStriker, wickets, runs }) => {
  const renderCard = (data) => {
    const wicketPercentage = calculatePercentage(data.bowlWkts, wickets);
    const runPercentage = calculatePercentage(data.bowlRuns, runs);
    return (
      <div className="batting-card">
        <div className="player-info">
          <div className="player-name">{data.bowlName}</div>
          <div className="runs-balls">Wickets: {data.bowlWkts}</div>
          <div className="run-percentage">{wicketPercentage} Taken</div>
          <div className="runs-balls">Runs Conceded: {data.bowlRuns}</div>
          <div className="run-percentage">{runPercentage} Conceded</div>
          <div className="strike-rate">Overs: {data.bowlOvs}</div>
          <div className="strike-rate">Economy: {data.bowlEcon}</div>
          <div className="strike-rate">Maidens: {data.bowlMaidens}</div>
          <div className="strike-rate">Wides: {data.bowlWides}</div>
          <div className="strike-rate">No Balls: {data.bowlNoballs}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="batting-cards-container">
      {renderCard(bowlerStriker)}
      {renderCard(bowlerNonStriker)}
    </div>
  );
};

const LastWicketDataCard = ({ lastWicket }) => {
  return (
    <div
      style={{
        marginTop: 10,
        marginBottom: 5,
      }}
    >
      <span>Last Wicket :</span>
      <span className="last-wicket">{lastWicket}</span>
    </div>
  );
};

const PlayerOfTheMatchCard = ({ fullName }) => {
  return (
    <div>
      <span>Player of the Match :</span>
      <span className="player-of-the-match">{fullName}</span>
    </div>
  );
};

const LastCommentCard = ({ commentText, event, overNumber, lastWicket }) => {
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
  const [showComm, setShowComm] = useState(false);
  return (
    <>
      <div className="com-wrapper">
        <div className="commWrapper" onClick={() => setShowComm(!showComm)}>
          <span
            style={{
              color: "#fff",
              fontWeight: 600,
              marginLeft: 5,
            }}
          >
            Latest Commentary
          </span>
          {showComm ? <ExpandLess /> : <ExpandMore />}
        </div>
        {showComm && (
          <>
            <div className="over-wrapper">
              <div className="over-number">{overNumber}</div>
              <div className="event">
                {event?.split(",").map((e, i) => EVENTS[e] || "")}
              </div>
            </div>
            <div>{commentText}</div>
            <>{lastWicket && <LastWicketDataCard lastWicket={lastWicket} />}</>
          </>
        )}
      </div>
    </>
  );
};

const UDRSCard = ({ matchData }) => {
  const [showUdrsDetails, setShowUdrsDetails] = useState(false);
  return (
    <div>
      <div
        className="commWrapper"
        onClick={() => setShowUdrsDetails(!showUdrsDetails)}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 600,
            marginLeft: 5,
          }}
        >
          UDRS
        </span>
        {showUdrsDetails ? <ExpandLess /> : <ExpandMore />}
      </div>
      {showUdrsDetails && (
        <table>
          <thead>
            <th></th>
            <th>Team</th>
            <th>Rem</th>
            <th>Successful</th>
            <th>UnSuccessful</th>
          </thead>
          <tbody>
            <tr>
              <td>
                <img
                  src={teamsData[matchData?.matchUdrs.team1Id]?.flag}
                  width={25}
                  height={18}
                  alt="Flag"
                />
              </td>
              <td>{matchData[matchData?.matchUdrs.team1Id]}</td>
              <td>{matchData?.matchUdrs.team1Remaining}</td>
              <td>{matchData?.matchUdrs.team1Successful}</td>
              <td>{matchData?.matchUdrs.team1Unsuccessful}</td>
            </tr>
            <tr>
              <td>
                <img
                  src={teamsData[matchData?.matchUdrs.team2Id]?.flag}
                  width={25}
                  height={18}
                  alt="Flag"
                />
              </td>
              <td>{matchData[matchData?.matchUdrs.team2Id]}</td>
              <td>{matchData?.matchUdrs.team2Remaining}</td>
              <td>{matchData?.matchUdrs.team2Successful}</td>
              <td>{matchData?.matchUdrs.team2Unsuccessful}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};
const ScoreComponent = ({ matchId, removeFromFollowList }) => {
  const [isMatchComplete, setIsMatchComplete] = useState(true);
  const [matchData, setMatchData] = useState({});
  const [matchState, setMatchState] = useState("Preview");
  const [showBatingDetails, setShowBatingDetails] = useState(false);
  const [showBowlingDetails, setShowBowlingDetails] = useState(false);

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
            batId: result?.miniscore?.batsmanStriker?.batId,
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
            batId: result?.miniscore?.batsmanNonStriker?.batId,
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
            bowlId: result?.miniscore?.bowlerStriker?.bowlId,
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
            bowlId: result?.miniscore?.bowlerNonStriker?.bowlId,
          },
          latestPerformance: result?.miniscore?.latestPerformance,
          matchScoreDetails: result?.miniscore?.matchScoreDetails,
          matchUdrs: result?.miniscore?.matchUdrs,
          commentaryList: result?.commentaryList[0],
        };
        setMatchData(tmpMatchInfo);
        setMatchState(result?.matchHeader?.state);
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
      commentaryList: result?.commentaryList[0],
    };

    setMatchState(result?.matchHeader?.state);
    setMatchData(tmpLiveScores);
    if (result?.matchHeader?.complete) {
      return clearInterval(intervalId);
    }
    return;
  }

  const MATCH_STATES = useMemo(
    () => ({
      Preview: 2,
      "Innings Break": 2,
      Complete: -1,
      Stumps: 2,
      "In Progress": 2,
    }),
    []
  );
  useEffect(() => {
    if (MATCH_STATES[matchState]) {
      setIsMatchComplete(MATCH_STATES[matchState] !== -1 ? false : true);
    } else {
      setIsMatchComplete(false);
    }
  }, [matchState, MATCH_STATES]);
  const [intervalId] = useInterval(
    fetchLiveScores,
    !isMatchComplete ? 2000 : null
  );
  return (
    <div
      style={{ marginLeft: 15, marginRight: 15, marginTop: 3, marginBottom: 3 }}
    >
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
        {matchState !== "Preview" && (
          <CrikcetCardToss
            tossWinner={matchData?.tossWinner}
            tossDecision={matchData?.tossDecision}
          />
        )}

        <MatchStatus status={matchData?.status} />
        {isMatchComplete && (
          <PlayerOfTheMatchCard
            name={
              matchData?.playersOfTheMatch &&
              matchData?.playersOfTheMatch[0]?.name
            }
            fullName={
              matchData?.playersOfTheMatch &&
              matchData?.playersOfTheMatch[0]?.fullName
            }
            captain={
              matchData?.playersOfTheMatch &&
              matchData?.playersOfTheMatch[0]?.captain
            }
            id={
              matchData?.playersOfTheMatch &&
              matchData?.playersOfTheMatch[0]?.id
            }
            keeper={
              matchData?.playersOfTheMatch &&
              matchData?.playersOfTheMatch[0]?.keeper
            }
            nickName={
              matchData?.playersOfTheMatch &&
              matchData?.playersOfTheMatch[0]?.nickName
            }
            substitute={
              matchData?.playersOfTheMatch &&
              matchData?.playersOfTheMatch[0]?.substitute
            }
            teamName={
              matchData?.playersOfTheMatch &&
              matchData?.playersOfTheMatch[0]?.team1Name
            }
          />
        )}
        {matchState !== "Preview" && (
          <>
            <CricketScoreCard
              crr={matchData.currentRunRate}
              rrr={matchData.requiredRunRate}
              matchScoreDetails={matchData?.matchScoreDetails}
            />
            <>
              {!isMatchComplete && (
                <PartnershipCard
                  runs={matchData?.partnerShip?.runs}
                  balls={matchData?.partnerShip?.balls}
                />
              )}
            </>
            <>
              {!isMatchComplete && (
                <>
                  <div
                    className="more-stats"
                    onClick={() => setShowBatingDetails(!showBatingDetails)}
                  >
                    {showBatingDetails ? "Hide" : "Show"} More Bating Details
                    {showBatingDetails ? <ExpandLess /> : <ExpandMore />}
                  </div>
                  {showBatingDetails ? (
                    <BattingCard
                      strikerData={matchData?.strikerData}
                      nonStrikerData={matchData?.nonStrikerData}
                      matchFormat={matchData?.matchFormat}
                      runs={matchData?.runs}
                    />
                  ) : (
                    <div>
                      <b>
                        {matchData?.strikerData?.batName} -{" "}
                        {matchData?.strikerData?.batRuns}(
                        {matchData?.strikerData?.batBalls})
                      </b>
                      <br />
                      {matchData?.nonStrikerData?.batName} -{" "}
                      {matchData?.nonStrikerData?.batRuns}(
                      {matchData?.nonStrikerData?.batBalls})
                    </div>
                  )}
                </>
              )}
            </>
            <>
              {!isMatchComplete && (
                <>
                  <div
                    className="more-stats"
                    onClick={() => setShowBowlingDetails(!showBowlingDetails)}
                  >
                    {showBowlingDetails ? "Hide" : "Show"} More Bowling Details
                    {showBowlingDetails ? <ExpandLess /> : <ExpandMore />}
                  </div>
                  {showBowlingDetails ? (
                    <BowlingCard
                      bowlerStriker={matchData?.bowlerStriker}
                      bowlerNonStriker={matchData?.bowlerNonStriker}
                      matchFormat={matchData?.matchFormat}
                      runs={matchData?.runs}
                      wickets={matchData?.wickets}
                    />
                  ) : (
                    <div>
                      <b>
                        {matchData?.bowlerStriker?.bowlName} -{" "}
                        {matchData?.bowlerStriker?.bowlRuns} -{" "}
                        {matchData?.bowlerStriker?.bowlWkts}
                      </b>
                      <br />
                      {matchData?.bowlerNonStriker?.bowlName} -{" "}
                      {matchData?.bowlerNonStriker?.bowlRuns} -{" "}
                      {matchData?.bowlerNonStriker?.bowlWkts}
                    </div>
                  )}
                </>
              )}
            </>

            <>
              {!isMatchComplete && matchData?.matchUdrs && (
                <UDRSCard matchData={matchData} />
              )}
            </>
            <>
              {!isMatchComplete && (
                <LastCommentCard
                  commentText={matchData?.commentaryList?.commText}
                  event={matchData?.commentaryList?.event}
                  overNumber={matchData?.commentaryList?.overNumber}
                  lastWicket={matchData?.lastWicket}
                />
              )}
            </>
          </>
        )}

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
