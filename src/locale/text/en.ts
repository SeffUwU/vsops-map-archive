import { FeatureTypeEnum } from '@/types/map/dialog.configs';

export const EnglishLocale = {
  statusTitle: {
    error: 'Error!',
    success: 'Success!',
  },
  statusMessage: {
    campaignJoinedSuccessful: 'Campaign successfully joined!',
  },
  auth: {
    signUpSuccess: 'Sign-up completed successfully.',
    signInSuccess: 'Sign-in successful',
    logoutSuccess: 'Logout successful.',
    signUp: 'Sign Up',
  },
  forms: {
    login: {
      title: 'Enter your login and password to login to your account',
      loginButton: 'Login',
      registerQuestion: 'New? Sign up here..',
    },
    signUp: {
      title: 'Enter your preffered login and password. Note: you must have an Invite Code to register.',
      signUpButton: 'Sign Up',
      loginQuestion: 'Already have an account? Sign in here..',
    },
  },
  sidebar: {
    home: 'Map',
    users: 'Users',
    profile: 'Profile',
    theme: 'Theme',
    language: 'Language',
    // map filter
    landmarks: 'Landmarks',
    traders: 'Traders',
    translocators: 'Translocators',
    custom: 'Custom',
  },
  pageTitles: {
    joinCampaign: 'Join campaign',
  },
  pageSpecific: {
    joinCampaign: {
      message: 'In order to join a campaign, you need to ask your DM for an invite code which is unique to a campaign.',
      directions: 'Input the invite code below:',
    },
  },
  headers: {
    campaigns: "Your currently active campaigns that you're a part of are going to be displayed here.",
    joinCampaign: 'You can join a campaign on this page.',
  },
  tooltips: {
    campaigns: {
      madeByYou: 'Ran by You',
      campaignGM: 'Ran by this GM',
    },
  },
  general: {
    joinedAt: 'joined at',
  },
  capitalizedWords: {
    invite: 'Invite',
    create: 'Create',
    join: 'Join',
    name: 'Name',
    description: 'Description',
    players: 'Players',
    creator: 'Creator',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    you: 'You',
    action: 'Action',
    inviteCode: 'Invite Code',
  },
  ui: {
    initializingContexts: 'Initializing contexts...',
    search: 'Goto Feature',
  },
  dialog: {
    feature: {
      nameTitle: 'Name',
      descriptionTitle: 'Description',
      selectTypeTitle: 'Type',
      selectValues: {
        base: 'Base',
        bow: 'Body of water',
        district: 'District',
        farm: 'Farm',
        library: 'Library',
        poi: 'Point of Interest',
        smithery: 'Smithery',
        town_hall: 'Town Hall',
        trader: 'Trader',
      } as Record<FeatureTypeEnum, string>,
    },
  },
};

export type LocaleType = typeof EnglishLocale;
