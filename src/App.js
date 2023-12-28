import axios from "axios";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo} from "react";
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
  Toss: 2,
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

const FlagImage = React.memo(({ flag, alt }) => {
  return (
    flag !== "" && <img src={flag} className="ml-3 mr-3 flag-style" alt={alt} />
  );
});

const TitleSpacing = React.memo(({ children }) => {
  return <span className="ml-3 mr-3">{children}</span>;
});

const TeamInfo = React.memo(({ flag, team }) => {
  return (
    <>
      <FlagImage flag={flag} alt={team} />
      <TitleSpacing>{team}</TitleSpacing>
    </>
  );
});

const CricketCardTitle = React.memo(({ flag1, team1, flag2, team2 }) => {
  return (
    <div className="flex-container align-center bold sz-14">
      <TeamInfo flag={flag1} team={team1} />
      <span>vs</span>
      <TeamInfo flag={flag2} team={team2} />
    </div>
  );
});

const CricketMatchFormat = React.memo(({ matchFormat }) => {
  return <div className={`sz-12 bold ${matchFormat}`}>{matchFormat}</div>;
});

const CricketCardSubtitle = React.memo(({ subtitle }) => {
  return <div className="mt-3 bold sz-10 grey">{subtitle}</div>;
});

const MatchStatus = React.memo(({ status }) => {
  return <div className="sz-12 bold green">{status}</div>;
});

const PlayerOfTheMatchCard = React.memo(({ fullName, isMatchComplete }) => {
  if (!isMatchComplete) return null;
  return (
    <div>
      <span>Player of the Match : </span>
      <span className="bold">{fullName}</span>
    </div>
  );
});

const CricketCardToss = React.memo(({ tossWinner, tossDecision, hidden }) => {
  if (hidden) return null;
  return (
    <div className="sz-12 bold">
      <span className="red">Toss:</span>
      {tossWinner ? tossWinner + "(" + tossDecision + ")" : "N/A"}
    </div>
  );
});

const CricketScoreCard = React.memo(
  ({ crr, rrr, inningsScoreList, hidden }) => {
    if (hidden || inningsScoreList === undefined) return null;
    return (
      <div className="cricket-card-scorecard-wrapper pt-5 pb-5 pl-3 pr-3">
        {inningsScoreList?.map((inning, index) => (
          <div className="flex-container justify-between" key={index}>
            <div className="flex-container sz-14" key={index}>
              <div className="mr-3 bold brown">{inning.batTeamName}</div>
              <div className="mr-3 bold green">
                {inning.score} / <span className="red">{inning.wickets}</span>
              </div>
              <div>({inning.overs})</div>
              {inning.isDeclared && <p>Declared</p>}
              {inning.isFollowOn && <p>Follow On</p>}
            </div>
            <div className="flex-container sz-14">
              {index === 0 && (
                <>
                  CRR :<span className="ml-2 mr-2 bold blue">{crr}</span>
                  {rrr > 0 && (
                    <>
                      RRR :<span className="ml-2 mr-2 bold red">{rrr}</span>
                    </>
                  )}
                </>
              )}
              {index !== 0 && (
                <>
                  RR:{" "}
                  <span className="ml-2 mr-2 bold blue">
                    {(inning.score / inning.overs).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

const PartnershipCard = React.memo(
  ({ runs, balls, oversRemaining, hidden }) => {
    if (hidden) return null;
    return (
      <div className="flex-container justify-between">
        <span>
          Partnership: <span className="bold blue">{runs}</span>
          <span className="bold brown">({balls})</span>
        </span>
        {oversRemaining ? (
          <span>
            Overs Rem: <span className="bold blue">{oversRemaining}</span>
          </span>
        ) : null}
      </div>
    );
  }
);

const BattingCard = React.memo(({ strikerData, nonStrikerData, runs, hidden }) => {
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
        <div className="batting-card p-10 mb-5 mt-5">
          <div className="mb-10">
            <div className="player-name sz-14 bold">{batName}</div>
            <div className="sz-14">
              Runs: {batRuns} ({batBalls})
            </div>
            <div className="orange bold">{runPercentage} Scored</div>
            <div className="sz-12 grey">Strike Rate: {batStrikeRate}</div>
            <div className="flex-container">
              <div className="sz-12 grey">
                Fours: <span className="sz-12 bold ml-1 mr-1">{batFours}</span>
              </div>
              <div className="sz-12 grey">
                Sixes: <span className="sz-12 bold ml-1 mr-1">{batSixes}</span>
              </div>
              <div className="sz-12 grey">
                Dots: <span className="sz-12 bold ml-1 mr-1">{batDots}</span>
              </div>
            </div>
          </div>
          <div
            className="flex-container wrap justify-end align-center blue cursor-pointer underline"
            onClick={() => setShowOtherStats(!showOtherStats)}
          >
            More Stats {showOtherStats ? <ExpandLess /> : <ExpandMore />}
          </div>
          {showOtherStats && (
            <div className="mins">
              Fours:{" "}
              <span className="sz-12 bold ml-1 mr-1">{fourPercentage}</span>
              <br />
              Sixes:{" "}
              <span className="sz-12 bold ml-1 mr-1">{sixPercentage}</span>
              <br />
              Dots:{" "}
              <span className="sz-12 bold ml-1 mr-1">{dotPercentage}</span>
              <br />
              Boundaries:{" "}
              <span className="sz-12 bold ml-1 mr-1">{boundaryPercentage}</span>
              <br />
              Time Spent:{" "}
              <span className="sz-12 bold ml-1 mr-1">{timeInHours}</span>
            </div>
          )}
        </div>
      );
    }
  };
  if (hidden) return null;
  return (
    <div className="flex-container justify-around">
      {renderCard(strikerData)}
      {renderCard(nonStrikerData)}
    </div>
  );
});

const SmallBattingCard = React.memo(
  ({
    hidden,
    strikerName,
    nonStrikerName,
    strikerRuns,
    nonStrikerRuns,
    strikerBalls,
    nonStrikerBalls,
  }) => {
    if (hidden) return null;
    return (
      <>
        <b>
          {strikerName} - {strikerRuns}({strikerBalls})
        </b>
        {nonStrikerName && (
          <>
            <br />
            {nonStrikerName} - {nonStrikerRuns}({nonStrikerBalls})
          </>
        )}
      </>
    );
  }
);

const BowlingCard = React.memo(({
  bowlerStriker,
  bowlerNonStriker,
  wickets,
  runs,
  hidden,
}) => {
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
      <div className="batting-card p-10 mb-5 mt-5">
        <div className="mb-10">
          <div className="player-name sz-14 bold">{bowlName}</div>
          <div className="sz-14">Wickets: {bowlWkts}</div>
          <div className="orange bold">{wicketPercentage} Taken</div>
          <div className="sz-14">Runs Conceded: {bowlRuns}</div>
          <div className="orange bold">{runPercentage} Conceded</div>
          <div className="sz-12 grey">Overs: {bowlOvs}</div>
          <div className="sz-12 grey">Economy: {bowlEcon}</div>
          <div className="sz-12 grey">Maidens: {bowlMaidens}</div>
          <div className="sz-12 grey">Wides: {bowlWides}</div>
          <div className="sz-12 grey">No Balls: {bowlNoballs}</div>
        </div>
      </div>
    );
  };
  if (hidden) return null;
  return (
    <div className="flex-container justify-around">
      {renderCard(bowlerStriker)}
      {renderCard(bowlerNonStriker)}
    </div>
  );
});

const SmallBowlingCard = React.memo(
  ({
    hidden,
    strikerName,
    nonStrikerName,
    strikerRuns,
    nonStrikerRuns,
    strikerWickets,
    nonStrikerWickets,
  }) => {
    if (hidden) return null;

    return (
      <>
        <b>
          {strikerName} - {strikerRuns} - {strikerWickets}
        </b>
        {nonStrikerName && (
          <>
            <br />
            {nonStrikerName} - {nonStrikerRuns} - {nonStrikerWickets}
          </>
        )}
      </>
    );
  }
);


const TitleClickonExpand = React.memo(
  ({ onClick, title, boolCheck, hidden }) => {
    const handleClick = useCallback(() => {
      onClick(!boolCheck);
    }, [onClick, boolCheck]);

    if (hidden) return null;
    return (
      <div
        className="flex-container justify-between align-center mt-5 mb-5 cursor-pointer bg-grey"
        onClick={handleClick}
      >
        <span className="ml-5 bold white">{title}</span>
        {boolCheck ? <ExpandLess /> : <ExpandMore />}
      </div>
    );
  },
  // Add a custom comparison function for props
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.boolCheck === nextProps.boolCheck &&
      prevProps.hidden === nextProps.hidden
    );
  }
);

const UDRSTable = React.memo(({ teams }) => {
  return (
    <table className="udrs-table mt-10">
      <thead>
        <tr>
          <th></th>
          <th>Team</th>
          <th>Remaining</th>
          <th>Successful</th>
          <th>Unsuccessful</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team, index) => (
          <tr key={index}>
            <td>
              {" "}
              <FlagImage flag={team.flag} alt={team.teamName} />
            </td>
            <td>{team.teamName}</td>
            <td>{team.teamUdrs?.remaining}</td>
            <td>{team.teamUdrs?.successful}</td>
            <td>{team.teamUdrs?.unsuccessful}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

const UDRSCard = React.memo(
  ({
    flag1,
    flag2,
    team1Name,
    team2Name,
    hidden,
    team1Remaining,
    team2Remaining,
    team1Successful,
    team2Successful,
    team1Unsuccessful,
    team2Unsuccessful,
  }) => {
    const [showUdrsDetails, setShowUdrsDetails] = useState(false);
    const handleClick = useCallback(() => {
      setShowUdrsDetails((prev) => !prev);
    }, []);

    if (hidden) return null;
    const teamsData = [
      {
        teamName: team1Name,
        teamUdrs: {
          remaining: team1Remaining,
          successful: team1Successful,
          unsuccessful: team1Unsuccessful,
        },
        flag: flag1,
      },
      {
        teamName: team2Name,
        teamUdrs: {
          remaining: team2Remaining,
          successful: team2Successful,
          unsuccessful: team2Unsuccessful,
        },
        flag: flag2,
      },
    ];
    return (
      <>
        <TitleClickonExpand
          onClick={handleClick}
          title="UDRS"
          boolCheck={showUdrsDetails}
        />
        {showUdrsDetails && <UDRSTable teams={teamsData} />}
      </>
    );
  }
);

const LastCommentCard = React.memo(
  ({ lastWicket, hidden, commText, event, overNumber }) => {
    const [showComm, setShowComm] = useState(false);
    const handleClick = useCallback(() => {
      setShowComm((prev) => !prev);
    }, []);
    const generateEventLabels = useCallback((events) => {
      return events.map((e, i) => EVENTS[e] || "").join(" ");
    }, []);
    if (hidden) return null;
    return (
      <>
        <TitleClickonExpand
          onClick={handleClick}
          title="Latest Commentary"
          boolCheck={showComm}
        />
        {showComm && (
          <>
            <div className="flex-container justify-between align-center bg-blue">
              <div className="ml-10 bold white">{overNumber}</div>
              <div className="mr-10 bold white">
                {generateEventLabels(event?.split(","))}
              </div>
            </div>
            <div>{commText}</div>
            {lastWicket && <LastWicketDataCard lastWicket={lastWicket} />}
          </>
        )}
      </>
    );
  }
);

const LastWicketDataCard = React.memo(({ lastWicket }) => {
  return (
    <div className="mt-10 mb-5">
      <span>Last Wicket :</span>{" "}
      <span className="text-center bold">{lastWicket}</span>
    </div>
  );
});

const CricketCardHeader = ({
  flag1,
  team1,
  flag2,
  team2,
  matchFormat,
  seriesName,
  status,
}) => (
  <>
    <div className="flex-container justify-between align-center">
      <CricketCardTitle
        flag1={flag1}
        team1={team1}
        flag2={flag2}
        team2={team2}
      />
      <CricketMatchFormat matchFormat={matchFormat} />
    </div>
    <CricketCardSubtitle subtitle={seriesName} />
    <MatchStatus status={status} />
  </>
);

const CricketMatchData = ({
  matchState,
  playersOfTheMatch,
  isMatchComplete,
  tossWinner,
  tossDecision,
  crr,
  rrr,
  matchScoreDetails,
}) => {
  const memoizedmatchScoreDetails = useMemo(
    () => matchScoreDetails,
    [matchScoreDetails]
  );
  if (matchState === "Preview") return null;
  return (
    <>
      <PlayerOfTheMatchCard
        fullName={playersOfTheMatch && playersOfTheMatch[0]?.fullName}
        isMatchComplete={isMatchComplete}
      />
      <CricketCardToss tossWinner={tossWinner} tossDecision={tossDecision} />
      <CricketScoreCard
        crr={crr}
        rrr={rrr}
        inningsScoreList={memoizedmatchScoreDetails?.inningsScoreList}
      />
    </>
  );
};
const CricketLiveData = ({
  matchState,
  partnerShip,
  oversRem,
  strikerData,
  nonStrikerData,
  matchFormat,
  runs,
  bowlerStriker,
  bowlerNonStriker,
  wickets,
  matchUdrs,
  flag1,
  flag2,
  team1Name,
  team2Name,
  commentaryList,
  lastWicket,
}) => {
  const [showBatingDetails, setShowBatingDetails] = useState(false);
  const [showBowlingDetails, setShowBowlingDetails] = useState(false);
  const memoizedStrikerData = useMemo(() => strikerData, [strikerData]);
  const memoizedNonStrikerData = useMemo(
    () => nonStrikerData,
    [nonStrikerData]
  );
  const memoizedbowlerStriker = useMemo(() => bowlerStriker, [bowlerStriker]);
  const memoizedbowlerNonStriker = useMemo(
    () => bowlerNonStriker,
    [bowlerNonStriker]
  );
  const memoizedmatchUdrs = useMemo(() => matchUdrs, [matchUdrs]);
  const memoizedcommentaryList = useMemo(() => commentaryList, [commentaryList]);
  const handleClick = useCallback(() => {
    setShowBatingDetails((prev) => !prev);
  }, []);
  const handleClick1 = useCallback(() => {
    setShowBowlingDetails((prev) => !prev);
  }, []);
  if (
    matchState === "Preview" ||
    matchState === "Complete" ||
    matchState === "Toss"
  ) {
    return null;
  }
  return (
    <>
      <PartnershipCard
        runs={partnerShip?.runs}
        balls={partnerShip?.balls}
        oversRemaining={oversRem}
      />
      <TitleClickonExpand
        onClick={handleClick}
        title="Batting"
        boolCheck={showBatingDetails}
      />
      <SmallBattingCard
        strikerName={memoizedStrikerData?.batName}
        nonStrikerName={memoizedNonStrikerData?.batName}
        strikerRuns={memoizedStrikerData?.batRuns}
        nonStrikerRuns={memoizedNonStrikerData?.batRuns}
        strikerBalls={memoizedStrikerData?.batBalls}
        nonStrikerBalls={memoizedNonStrikerData?.batBalls}
        hidden={showBatingDetails}
      />
      <BattingCard
        strikerData={memoizedStrikerData}
        nonStrikerData={memoizedNonStrikerData}
        runs={runs}
        hidden={!showBatingDetails}
      />
      <TitleClickonExpand
        onClick={handleClick1}
        title="Bowling Stats"
        boolCheck={showBowlingDetails}
      />
      <SmallBowlingCard
        strikerName={memoizedbowlerStriker?.bowlName}
        nonStrikerName={memoizedbowlerNonStriker?.bowlName}
        strikerRuns={memoizedbowlerStriker?.bowlRuns}
        nonStrikerRuns={memoizedbowlerNonStriker?.bowlRuns}
        strikerWickets={memoizedbowlerStriker?.bowlWkts}
        nonStrikerWickets={memoizedbowlerNonStriker?.bowlWkts}
        hidden={showBatingDetails}
      />
      <BowlingCard
        bowlerStriker={bowlerStriker}
        bowlerNonStriker={bowlerNonStriker}
        matchFormat={matchFormat}
        runs={runs}
        wickets={wickets}
        hidden={!showBowlingDetails}
      />
      <UDRSCard
        flag1={flag1}
        flag2={flag2}
        team1Name={team1Name}
        team2Name={team2Name}
        team1Remaining={memoizedmatchUdrs?.team1Remaining}
        team1Successful={memoizedmatchUdrs?.team1Successful}
        team1Unsuccessful={memoizedmatchUdrs?.team1Unsuccessful}
        team2Remaining={memoizedmatchUdrs?.team2Remaining}
        team2Successful={memoizedmatchUdrs?.team2Successful}
        team2Unsuccessful={memoizedmatchUdrs?.team2Unsuccessful}
      />
      <LastCommentCard
        commText={memoizedcommentaryList?.commText}
        event={memoizedcommentaryList?.event}
        overNumber={memoizedcommentaryList?.overNumber}
        lastWicket={lastWicket}
      />
    </>
  );
};
const ScoreComponent = ({ matchId, removeFromFollowList }) => {
  const [isMatchComplete, setIsMatchComplete] = useState(true);
  const [matchData, setMatchData] = useState({});
  const [matchState, setMatchState] = useState("Preview");

  const fetchLiveScores = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}${matchId}`);
      const { matchHeader, miniscore, commentaryList } = data;
      let matchInfo = {
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
      setMatchData(matchInfo);
      setMatchState(matchHeader?.state);
      return;
    } catch (error) {
      console.error("Error fetching live scores:", error);
    }
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
    <div className="ml-15 mr-15 mt-3 mb-3">
      <div className="pt-5 pb-10 pl-10 pr-10 bg-white cricket-card">
        <CricketCardHeader
          flag1={flag1}
          team1={team1Name}
          flag2={flag2}
          team2={team2Name}
          matchFormat={matchFormat}
          seriesName={seriesName}
          status={status}
        />
        <CricketMatchData
          matchState={matchState}
          playersOfTheMatch={playersOfTheMatch}
          isMatchComplete={isMatchComplete}
          tossWinner={tossWinner}
          tossDecision={tossDecision}
          crr={currentRunRate}
          rrr={requiredRunRate}
          matchScoreDetails={matchScoreDetails}
        />
        <CricketLiveData
          matchState={matchState}
          partnerShip={partnerShip}
          oversRem={oversRem}
          strikerData={strikerData}
          nonStrikerData={nonStrikerData}
          matchFormat={matchFormat}
          runs={runs}
          bowlerStriker={bowlerStriker}
          bowlerNonStriker={bowlerNonStriker}
          wickets={wickets}
          matchUdrs={matchUdrs}
          flag1={flag1}
          flag2={flag2}
          team1Name={team1Name}
          team2Name={team2Name}
          commentaryList={commentaryList}
          lastWicket={lastWicket}
        />
        <div className="flex-container justify-center mt-3 mb-3">
          <button
            className="btn bg-red border-red white cursor-pointer"
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
      <div className="flex-container wrap">
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
        className="btn bg-green border-green black cursor-pointer"
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
