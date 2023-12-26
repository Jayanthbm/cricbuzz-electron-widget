import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'https://www.cricbuzz.com/api/cricket-match/commentary/';

const TEAMS = {
  "2": {
    name: "India",
    shortName: "IND",
    flag:'https://static.cricbuzz.com/a/img/v1/25x18/i1/c172115/india.jpg',
  },
  "3": {
    name: "Pakistan",
    shortName: "PAK",
    flag: '',
  },
  "4": {
    name: "Australia",
    shortName: "AUS",
    flag: '',
  },
  "5": {
    name: "Sri Lanka",
    shortName: "SL",
    flag: '',
  },
  "6": {
    name: "Bangladesh",
    shortName: "BNG",
    flag: '',
  },
  "9": {
    name: "England ",
    shortName: "ENG",
    flag: '',
  },
  "27": {
    name: "Ireland ",
    shortName: "IRE",
    flag: '',
  },
  "96": {
    name: "Afghanistan ",
    shortName: "AFG",
    flag: '',
  }
}
const ScoreComponent = ({ matchId, removeFromFollowList }) => {
  const [matchInfo, setMatchInfo] = useState(null);
  const [liveScores, setLiveScores] = useState(null);
  const [infoLoaded, setInfoLoaded] = useState(false);
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
        };
        setMatchInfo(tmpMatchInfo);
        setInfoLoaded(true);
      } catch (error) {
        setMatchInfo({});
        setInfoLoaded(false);
      }
    }
    if (matchId) {
      fetchMatchInfo();
    }
  }, [matchId]);


  useEffect(() => {
    let interval;
    async function fetchLiveScores() {
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
      };
      setLiveScores(tmpLiveScores);
    }
    if (infoLoaded) {
      fetchLiveScores(); // Initial call when infoLoaded is true
      // interval = setInterval(fetchLiveScores, 5 * 60 * 1000); // Call fetchLiveScores every 5 minutes
      interval = setInterval(fetchLiveScores, 2 * 1000); // Call fetchLiveScores every 2 seconds
    }

    return () => clearInterval(interval);
  }, [infoLoaded, matchId])
  return (
    <div style={{marginLeft:15,marginRight:15}}>
      <div className='cricket-card'>
        <div className='cricket-card-title-wrapper'>
          <div className='cricket-card-title'>{matchInfo?.matchBetween}</div>
          <div className={`cricket-card-format ${matchInfo?.matchFormat}`}>{matchInfo?.matchFormat}</div>
        </div>
        <div className='cricket-card-subtitle'>{matchInfo?.seriesName}</div>
        <div className='cricket-card-body'>
          <div className='cricket-card-toss'>
            <span className='cricket-card-toss-title'>Toss:</span>{matchInfo?.tossWinner ? matchInfo?.tossWinner + '(' + matchInfo?.tossDecision + ')' : 'N/A'}
          </div>
          <span className='cricket-card-status-title'>{matchInfo?.status ? matchInfo?.status : 'N/A'}</span>
        </div>
        {liveScores && (
          <>
            <div className='cricket-card-scorecard-wrapper'>
              <div className='cricket-card-score'>
                <div className='cricket-card-score-teamName'> {TEAMS[liveScores?.teamId]?.shortName ? (
                  <>
                    <span>{TEAMS[liveScores?.teamId].shortName}</span>
                  </>
                ) : <>
                </>}
                </div>
                <div className='cricket-card-score-runs'>{liveScores?.runs}</div>
                <div> / </div>
                <div className='cricket-card-score-wickets'>{liveScores?.wickets}</div>
                <div className='cricket-card-score-overs'> ( {liveScores?.overs} )</div>
              </div>
              <div className='cricket-card-run-rate-wrapper'>
                <div>CRR :<span className='crr'>{liveScores.currentRunRate}</span></div>
                {liveScores?.requiredRunRate > 0 && (
                  <div>RRR :<span className='rrr'>{liveScores.requiredRunRate}</span></div>
                )}
              </div>
            </div>
            <span>Partnership :</span> <span className='runs'>{liveScores?.partnerShip?.runs}</span>
            <span className='balls'>({liveScores?.partnerShip?.balls}) </span>
            <div className='cricket-card-batsman-wrapper'>
              <div className='striker-card'>
                <span className='striker-name'>{liveScores?.strikerData?.batName}</span>
                <span className='runs'>{liveScores?.strikerData?.batRuns}</span>
                <span className='balls'>({liveScores?.strikerData?.batBalls}) </span>
              </div>
                ||
              <div className='non-striker-card'>
                <span className='non-striker-name'>{liveScores?.nonStrikerData?.batName}</span>
                <span className='runs'>{liveScores?.nonStrikerData?.batRuns}</span>
                <span className='balls'>({liveScores?.nonStrikerData?.batBalls}) </span>
              </div>
            </div>
            <p>{liveScores?.lastWicket}</p>
          </>
        )}
       
      </div>
      <button className='deleteBtn' onClick={removeFromFollowList}> Unfollow</button>
    </div>
  );
};
function App() {
  const [matchIds, setMatchIds] = useState([]);
  const [tempMatchId, setTempMatchId] = useState('');
  useEffect(() => {
    const matches = localStorage.getItem('matches');
    if (matches) setMatchIds(JSON.parse(matches));
  }, [])

  function addMatchtoFollowList(matchId) {
    const newMatchIds = Array.from(new Set([...matchIds, matchId]));
    setMatchIds(newMatchIds);
    localStorage.setItem('matches', JSON.stringify(newMatchIds));
  }

  function removeFromFollowList(index) {
    const newMatchIds = matchIds.filter((_, i) => i !== index);
    setMatchIds(newMatchIds);
    localStorage.setItem('matches', JSON.stringify(newMatchIds));
  }
  return (
    <>
      <div style={{display:'flex',flexWrap:'wrap'}}>
      {matchIds.map((matchId, index) => {
        return (
          <ScoreComponent
            matchId={matchId}
            removeFromFollowList={() => removeFromFollowList(index)}
            key={matchId}
          />
        )
      })}
      </div>
      <hr />
      <input type="number" value={tempMatchId} onChange={(e) => setTempMatchId(e.target.value)} />
      <button
        onClick={() => {
          addMatchtoFollowList(tempMatchId)
          setTempMatchId('')
        }}>
        Follow New Match
      </button>
    </>
  );
}

export default App;
