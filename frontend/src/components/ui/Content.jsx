const Content = ({ children, ...props }) => {
  return (
    <div className="flex-1 flex flex-col gap-5" {...props}>
      {children}
    </div>
  );
};

export default Content;
