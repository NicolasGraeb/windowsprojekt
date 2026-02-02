import { ApiParticipant } from '../config/api';
import { Participant } from '../models/Participant';

export function mapApiParticipantToParticipant(apiParticipant: ApiParticipant): Participant {
  return new Participant(
    apiParticipant.id.toString(),
    apiParticipant.firstName,
    apiParticipant.lastName,
    apiParticipant.email,
    apiParticipant.phone || '',
    '' // organization - nie ma w API
  );
}

export function mapParticipantToApiParticipant(participant: Participant): Partial<ApiParticipant> {
  return {
    firstName: participant.getFirstName(),
    lastName: participant.getLastName(),
    email: participant.getEmail(),
    phone: participant.getPhone() || undefined,
  };
}
