import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [
  {
    path: '',
    title: '-- Main',
    icon: '',
    class: 'header',
    groupTitle: true,
    submenu: []
  },
  {
    path: '',
    title: 'WAC',
    icon: 'menu-icon ti-star',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/',
        title: 'uR Demonstration 1',
        icon: '',
        class: 'ml-sub-menu',
        groupTitle: false,
        submenu: [
          {
            path: '/dashboard/demo',
            title: 'Second Level',
            icon: '',
            class: '',
            groupTitle: false,
            submenu: []
          }
        ]
      }
    ]
  },
  {
    path: '',
    title: 'Home',
    icon: 'menu-icon ti-home',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/dashboard/main',
        title: 'Dashboard 1',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/dashboard/dashboard2',
        title: 'Dashboard 2',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/dashboard/dashboard3',
        title: 'Dashboard 3',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '/tables/advance-table',
    title: 'Advance Table',
    icon: 'menu-icon ti-layout',
    class: '',
    groupTitle: false,
    submenu: []
  },
  {
    path: '',
    title: 'Widgets',
    icon: 'menu-icon ti-crown',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/widget/chart-widget',
        title: 'Chart Widget',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/widget/data-widget',
        title: 'Data Widget',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'User Interface (UI)',
    icon: 'menu-icon ti-magnet',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/ui/alerts',
        title: 'Alerts',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/animations',
        title: 'Animations',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/badges',
        title: 'Badges',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/chips',
        title: 'Chips',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/modal',
        title: 'Modal',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/buttons',
        title: 'Buttons',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/expansion-panel',
        title: 'Expansion Panel',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/bottom-sheet',
        title: 'Bottom Sheet',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/dialogs',
        title: 'Dialogs',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/cards',
        title: 'Cards',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/labels',
        title: 'Labels',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/list-group',
        title: 'List Group',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/media-object',
        title: 'Media Object',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/snackbar',
        title: 'Snackbar',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/preloaders',
        title: 'Preloaders',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/progressbars',
        title: 'Progress Bars',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/tabs',
        title: 'Tabs',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/typography',
        title: 'Typography',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/ui/helper-classes',
        title: 'Helper Classes',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Forms',
    icon: 'menu-icon ti-layout',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/forms/form-controls',
        title: 'Form Controls',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/forms/advance-controls',
        title: 'Advanced Controls',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/forms/form-example',
        title: 'Form Examples',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/forms/form-validation',
        title: 'Form Validation',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/forms/wizard',
        title: 'Form Wizard',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/forms/editors',
        title: 'Editors',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Tables',
    icon: 'menu-icon ti-menu-alt',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/tables/basic-tables',
        title: 'Basic Tables',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/tables/material-tables',
        title: 'Material Tables',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/tables/ngx-datatable',
        title: 'ngx-datatable',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Icons',
    icon: 'menu-icon ti-face-smile',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/icons/material',
        title: 'Material Icons',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/icons/font-awesome',
        title: 'Font Awesome',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/icons/simple-line',
        title: 'Simple Line Icons',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/icons/themify',
        title: 'Themify Icons',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: '-- Apps',
    icon: '',
    class: 'header',
    groupTitle: true,
    submenu: []
  },
  {
    path: '',
    title: 'Email',
    icon: 'menu-icon ti-email',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/email/inbox',
        title: 'Inbox',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/email/compose',
        title: 'Compose',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/email/read-mail',
        title: 'Read Email',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Apps',
    icon: 'fab fa-google-play',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/apps/chat',
        title: 'Chat',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/apps/dragdrop',
        title: 'Drag & Drop',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/apps/calendar',
        title: 'Calendar',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/apps/contact-list',
        title: 'Contact List',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/apps/contact-grid',
        title: 'Contact Grid',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/apps/support',
        title: 'Support',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Charts',
    icon: 'menu-icon ti-stats-up',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/charts/echart',
        title: 'Echart',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/charts/morris',
        title: 'Morris',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/charts/apex',
        title: 'Apex',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/charts/chartjs',
        title: 'ChartJS',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/charts/ngx-charts',
        title: 'Ngx-Charts',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/charts/gauge',
        title: 'Gauge',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/charts/sparkline',
        title: 'Sparkline',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Maps',
    icon: 'menu-icon ti-map-alt',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/maps/google',
        title: 'Google Map',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: '-- Extra',
    icon: '',
    class: 'header',
    groupTitle: true,
    submenu: []
  },
  {
    path: '',
    title: 'Timeline',
    icon: 'menu-icon ti-split-v',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/timeline/timeline1',
        title: 'Timeline 1',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/timeline/timeline2',
        title: 'Timeline 2',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Medias',
    icon: 'menu-icon ti-image',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/media/gallery',
        title: 'Image Gallery',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/media/carousel',
        title: 'Carousel',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Authentication',
    icon: 'menu-icon ti-user',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/authentication/login',
        title: 'Sign In',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/authentication/register',
        title: 'Sign Up',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/authentication/forgot-password',
        title: 'Forgot Password',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/authentication/locked',
        title: 'Locked',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/authentication/page404',
        title: '404 - Not Found',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/authentication/page500',
        title: '500 - Server Error',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Extra Pages',
    icon: 'menu-icon ti-receipt',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '/extra-pages/profile',
        title: 'Profile',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/extra-pages/pricing',
        title: 'Pricing',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/extra-pages/invoice',
        title: 'Invoice',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/extra-pages/faqs',
        title: 'Faqs',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/extra-pages/blank',
        title: 'Blank Page',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  },
  {
    path: '',
    title: 'Multi level Menu',
    icon: 'menu-icon ti-angle-double-down',
    class: 'menu-toggle',
    groupTitle: false,
    submenu: [
      {
        path: '#',
        title: 'First',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      },
      {
        path: '/',
        title: 'Second',
        icon: '',
        class: 'ml-sub-menu',
        groupTitle: false,
        submenu: [
          {
            path: '/',
            title: 'Second 1',
            icon: '',
            class: '',
            groupTitle: false,
            submenu: []
          },
          {
            path: '/',
            title: 'Second 2',
            icon: '',
            class: '',
            groupTitle: false,
            submenu: []
          }
        ]
      },
      {
        path: '#',
        title: 'Third',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        submenu: []
      }
    ]
  }
];
