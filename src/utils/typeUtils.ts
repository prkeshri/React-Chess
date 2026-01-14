import { TeamType } from "../Types"

export const invertTeam = (value: TeamType): TeamType => {
    return value === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR;
}
