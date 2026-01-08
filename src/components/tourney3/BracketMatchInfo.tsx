"use client";
import { useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import {
  getTeamRedemptionScores,
  getTeamScores,
} from "@/lib/services/phasmoTourney3";

interface Props {
  team1: string;
  team2: string;
  roundnumber: number;
  redemption?: boolean;
}
export default function BracketMatchInfo({
  team1,
  team2,
  roundnumber,
  redemption,
}: Props) {
  const [first, setFirst] = useState<number[] | undefined>();
  const [firstRedemption, setFirstRedemption] = useState<
    number[] | undefined
  >();
  const [second, setSecond] = useState<number[] | undefined>();
  const [secondRedemption, setSecondRedemption] = useState<
    number[] | undefined
  >();
  const [winner, setWinner] = useState<string>("");

  async function load() {
    const team1Data = await getTeamScores(team1);
    const team1Redeem = await getTeamRedemptionScores(team1);
    setFirst(team1Data);
    setFirstRedemption(team1Redeem);
    const team2Data = await getTeamScores(team2);
    const team2Redeem = await getTeamRedemptionScores(team2);
    setSecond(team2Data);
    setSecondRedemption(team2Redeem);
    if (!redemption) {
      if (
        (team1Data !== undefined && team2Data === undefined) ||
        (team2Data &&
          team1Data &&
          team1Data[roundnumber - 1] > team2Data[roundnumber - 1])
      )
        setWinner("first");
      if (
        (team2Data !== undefined && team1Data === undefined) ||
        (team2Data &&
          team1Data &&
          team2Data[roundnumber - 1] > team1Data[roundnumber - 1])
      )
        setWinner("second");
    } else {
      if (
        (team1Redeem !== undefined && team2Redeem === undefined) ||
        (team2Redeem &&
          team1Redeem &&
          team1Redeem[roundnumber - 1] > team2Redeem[roundnumber - 1])
      )
        setWinner("first");
      if (
        (team2Redeem !== undefined && team1Redeem === undefined) ||
        (team2Redeem &&
          team1Redeem &&
          team2Redeem[roundnumber - 1] > team1Redeem[roundnumber - 1])
      )
        setWinner("second");
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, []);

  let team1Line: string;
  let team2Line: string;
  if (!redemption) {
    team1Line = `${team1} [${
      first ? first[roundnumber - 1] + " points" : "N/A"
    }]`;
    team2Line = `${team2} [${
      second ? second[roundnumber - 1] + " points" : "N/A"
    }]`;
  } else {
    team1Line = `${team1} [${
      firstRedemption ? firstRedemption[roundnumber - 1] + " points" : "N/A"
    }]`;
    team2Line = `${team2} [${
      secondRedemption ? secondRedemption[roundnumber - 1] + " points" : "N/A"
    }]`;
  }
  const renderTeam = (line: string, isWinner: boolean) =>
    isWinner ? (
      <Badge bg="success" className="fw-semibold" aria-label="Winner team">
        {line}
      </Badge>
    ) : (
      <span>{line}</span>
    );
  return (
    <>
      {renderTeam(team1Line, winner === "first")}{" "}
      <span className="fw-bold mx-1">vs</span>{" "}
      {renderTeam(team2Line, winner === "second")}
    </>
  );
}
