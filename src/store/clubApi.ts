import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase'

export type ClubData = {
  name: string
  number: string
  area: string
  day: string
  time: string
  phone: string
  venue: string
  address: string
  restriction: string
  website: string
  facebook: string
}

type ClubDetailsDoc = {
  clubName?: string
  clubNumber?: string
  area?: string
  meetingDay?: string
  meetingTime?: string
  phone?: string
  locationName?: string
  address?: string
  city?: string
  state?: string
  country?: string
  membershipRestriction?: string
  website?: string
  facebookPage?: string
}

export const CLUB_DEFAULTS: ClubData = {
  name: 'Dhwani Toastmasters',
  number: '04410336',
  area: 'Club 227 · Area D04',
  day: 'Every Saturday',
  time: '3:00 – 5:00 PM',
  phone: '+91 86604 54918',
  venue: 'Transcend College, Post Office Rd',
  address: 'Krishna Devaraya Nagar, Yelachenahalli, Kumaraswamy Layout, Bengaluru 560078',
  restriction: 'Open to all — no membership restrictions',
  website: '',
  facebook: '',
}

export const clubApi = createApi({
  reducerPath: 'clubApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getClubDetails: builder.query<ClubData, void>({
      async queryFn() {
        try {
          const snap = await getDocs(query(collection(db, 'club-details'), limit(1)))
          if (snap.empty) return { data: CLUB_DEFAULTS }
          const d = snap.docs[0].data() as ClubDetailsDoc
          return {
            data: {
              name: d.clubName || CLUB_DEFAULTS.name,
              number: d.clubNumber || CLUB_DEFAULTS.number,
              area: d.area || CLUB_DEFAULTS.area,
              day: d.meetingDay || CLUB_DEFAULTS.day,
              time: d.meetingTime || CLUB_DEFAULTS.time,
              phone: d.phone || CLUB_DEFAULTS.phone,
              venue: d.locationName || CLUB_DEFAULTS.venue,
              address: [d.address, d.city, d.state].filter(Boolean).join(', ') || CLUB_DEFAULTS.address,
              restriction: d.membershipRestriction || CLUB_DEFAULTS.restriction,
              website: d.website || '',
              facebook: d.facebookPage || '',
            },
          }
        } catch (error) {
          console.error('Error fetching club details:', error)
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } }
        }
      },
    }),
  }),
})

export const { useGetClubDetailsQuery } = clubApi
