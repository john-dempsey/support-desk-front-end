// Sets the browser tab's title for the page it's in, e.g. "Tickets ·
// Support Desk". Tabs, browser history and screen readers use the title
// to tell pages apart, so every page needs its own.
//
// React 19 moves a <title> rendered anywhere in a component into the
// page's <head>, and takes it out again when the component goes away (the
// tab then shows index.html's "Support Desk" until the next page renders
// its own). So no effect and no library are needed.
function PageTitle({ title }) {
  // <title> must have exactly one piece of text inside it. Written as
  // <title>{title} · Support Desk</title>, it would have two pieces and
  // the tab would show no title at all, so the text is joined first.
  return <title>{`${title} · Support Desk`}</title>;
}

export default PageTitle;
